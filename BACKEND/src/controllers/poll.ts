import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Poll } from "../models/poll.model";
import { RoleEnum } from "../types";
import { BadRequest, Unauthorized } from "../customErrors";
import { validate } from "../middlewares/Validator";
import {
  createPollValidator,
  updatePollValidator,
  respondPollValidator,
  idParamValidator,
} from "../validators/poll.validator";
import { allowRoles } from "../middlewares/RoleGuard";

const router = Router();

// ----------------------------------------------------------------------
// CREATE POLL (Admin, HOD, Faculty)
// ----------------------------------------------------------------------
router.post(
  "/",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY),
  validate(createPollValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { question, options, targetAudience, expiresAt } = req.body;
    const user = req.user;

    // Ensure at least one target audience
    if (!targetAudience || targetAudience.length === 0) {
      throw new BadRequest("At least one target audience role is required");
    }

    const poll = await Poll.create({
      question,
      options,
      createdBy: {
        role: user.role,
        id: user._id, // directly use user._id
      },
      targetAudience,
      expiresAt,
      responses: [],
    });

    res.status(201).json(poll);
  }),
);

// ----------------------------------------------------------------------
// GET ALL POLLS (filtered by user role)
// ----------------------------------------------------------------------
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user.role;
    const { page = 1, limit = 10, active } = req.query;

    // Create filter based on user role
    let filter: any = { targetAudience: { $in: [userRole] } };

    // Optionally filter by active polls (not expired)
    if (active === "true") {
      filter.expiresAt = { $gt: new Date() };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch polls and total count
    const [polls, total] = await Promise.all([
      Poll.find(filter)
        .populate("createdBy.id", "name email") // populate the user data
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }), // Sort by creation date (desc)
      Poll.countDocuments(filter), // Get the total count of polls
    ]);

    // Response with polls and pagination info
    res.json({
      polls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

// ----------------------------------------------------------------------
// GET POLL BY ID
// ----------------------------------------------------------------------
router.get(
  "/:id",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY, RoleEnum.STUDENT),
  validate(idParamValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    const poll = await Poll.findById(id).populate("createdBy.id", "name email");
    if (!poll) {
      throw new BadRequest("Poll not found");
    }

    // Check if user is allowed to see this poll
    if (!poll.targetAudience.includes(user.role)) {
      throw new Unauthorized("You are not authorized to view this poll");
    }

    res.json(poll);
  }),
);

// ----------------------------------------------------------------------
// RESPOND TO POLL (vote)
// ----------------------------------------------------------------------
router.post(
  "/:id/respond",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY, RoleEnum.STUDENT),
  validate(respondPollValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { selectedOption } = req.body;
    const user = req.user;

    const poll = await Poll.findById(id);
    if (!poll) {
      throw new BadRequest("Poll not found");
    }

    // Check if poll is still active
    if (poll.expiresAt < new Date()) {
      throw new BadRequest("Poll has expired");
    }

    // Check if user is allowed to respond
    if (!poll.targetAudience.includes(user.role)) {
      throw new Unauthorized("You are not authorized to respond to this poll");
    }

    // Check if option is valid
    if (!poll.options.includes(selectedOption)) {
      throw new BadRequest("Invalid option");
    }

    // Check if user already responded
    const alreadyResponded = poll.responses.some(
      (r) => r.user.id.toString() === user._id.toString(),
    );
    if (alreadyResponded) {
      throw new BadRequest("You have already responded to this poll");
    }

    // Add response
    poll.responses.push({
      user: {
        role: user.role,
        id: user._id as any,
      },
      selectedOption,
      respondedAt: new Date(),
    });

    await poll.save();

    res.json({ message: "Response recorded", poll });
  }),
);

// ----------------------------------------------------------------------
// UPDATE POLL (only creator)
// ----------------------------------------------------------------------
router.patch(
  "/:id",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY),
  validate(updatePollValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const updates = req.body;

    const poll = await Poll.findById(id);
    if (!poll) {
      throw new BadRequest("Poll not found");
    }

    // Only the creator can update
    if (poll.createdBy.id.toString() !== user._id.toString()) {
      throw new Unauthorized("You are not the creator of this poll");
    }

    // Prevent updating responses directly
    delete updates.responses;

    Object.assign(poll, updates);
    await poll.save();

    res.json(poll);
  }),
);

// ----------------------------------------------------------------------
// DELETE POLL (creator or Admin)
// ----------------------------------------------------------------------
router.delete(
  "/:id",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY),
  validate(idParamValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    const poll = await Poll.findById(id);
    if (!poll) {
      throw new BadRequest("Poll not found");
    }

    // Admin can delete any; others only their own
    if (
      user.role !== RoleEnum.ADMIN &&
      poll.createdBy.id.toString() !== user._id.toString()
    ) {
      throw new Unauthorized("You are not authorized to delete this poll");
    }

    await poll.deleteOne();

    res.json({ message: "Poll deleted successfully" });
  }),
);

// ----------------------------------------------------------------------
// GET POLL RESULTS (with vote counts)
// ----------------------------------------------------------------------
router.get(
  "/:id/results",
  allowRoles(RoleEnum.ADMIN, RoleEnum.HOD, RoleEnum.FACULTY, RoleEnum.STUDENT),
  validate(idParamValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    const poll = await Poll.findById(id);
    if (!poll) {
      throw new BadRequest("Poll not found");
    }

    // Check access
    if (!poll.targetAudience.includes(user.role)) {
      throw new Unauthorized("You are not authorized to view results");
    }

    // Calculate counts
    const results: Record<string, number> = {};
    poll.options.forEach((opt) => (results[opt] = 0));
    poll.responses.forEach((r) => {
      results[r.selectedOption] = (results[r.selectedOption] || 0) + 1;
    });

    res.json({
      pollId: poll._id,
      question: poll.question,
      options: poll.options,
      results,
      totalResponses: poll.responses.length,
    });
  }),
);

export default router;
