import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { LeaveRequest } from "../models/leaveRequest.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import {
  createLeaveValidator,
  updateLeaveStatusValidator,
} from "../validators/leave.validator";
import { BadRequest } from "../customErrors";

const router = Router();

// Create leave request (HOD, Faculty, Student)
router.post(
  "/",
  allowRoles("STUDENT", "FACULTY", "HOD"),
  validate(createLeaveValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, reason } = req.body;
    const leave = await LeaveRequest.create({
      user: { role: req.user.role, id: req.user._id },
      startDate,
      endDate,
      reason,
      status: "PENDING",
    });
    // Populate for response
    await leave.populate("user.id", "name email");
    res.status(201).json(leave);
  }),
);

// Get my leave requests
router.get(
  "/me",
  allowRoles("HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const leaves = await LeaveRequest.find({
      "user.id": req.user._id,
      "user.role": req.user.role, // convert to lowercase
    }).sort({ createdAt: -1 });
    res.json(leaves);
  })
);


// Get all leave requests (for approval)
router.get(
  "/",
  allowRoles("HOD", "FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id } = req.user;
    const { status } = req.query; // optional filter by status
    let query: any = {};

    if (role === "FACULTY") {
      // Faculty can only see their own requests
      query = { "user.id": _id };
    } else if (role === "HOD") {
      // HOD sees requests from faculty and students
      query = { "user.role": { $in: ["faculty", "student"] } };
    }
    // Admin sees all (no filter)

    if (status) {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("user.id", "name email")   // populate user details
      .populate("approvedBy.id", "name")
      .sort({ createdAt: -1 });
    res.json(leaves);
  })
);

// Get single leave request
router.get(
  "/:id",
  allowRoles("HOD", "FACULTY", "STUDENT", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate("user.id", "name email rollNo")
      .populate("approvedBy.id", "name email");
    if (!leave) throw new BadRequest("Leave request not found");
    // Check authorization
    const { role, _id } = req.user;
    if (role === "FACULTY" || role === "STUDENT") {
      if (leave.user.id.toString() !== _id.toString()) {
        throw new BadRequest("You are not authorized to view this request");
      }
    }
    res.json(leave);
  }),
);

// Update leave status (approve/reject) – HOD only (or faculty for students? We'll stick to HOD)
router.patch(
  "/:id/status",
  allowRoles("HOD", "FACULTY"),
  validate(updateLeaveStatusValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) throw new BadRequest("Leave request not found");
    if (leave.status !== "PENDING") {
      throw new BadRequest("Leave request already processed");
    }
    const { status } = req.body;
    const requesterRole = req.user.role as
      | "FACULTY"
      | "HOD"
      | "STUDENT";

    // Only faculty & HOD are allowed to approve/reject
    if (requesterRole === "STUDENT") {
      throw new BadRequest("Students cannot approve or reject leave requests");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequest("Leave request already processed");
    }
    leave.status = status;
    leave.approvedBy = { role: requesterRole, id: req.user._id as any };
    await leave.save();
    // Populate before returning
    await leave.populate("user.id", "name email");
    await leave.populate("approvedBy.id", "name email");
    res.json(leave);
  }),
);

// Delete leave request (only the requester or admin)
router.delete(
  "/:id",
  allowRoles("HOD", "FACULTY", "STUDENT", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) throw new BadRequest("Leave request not found");
    if (
      req.user.role !== "ADMIN" &&
      leave.user.id.toString() !== req.user._id.toString()
    ) {
      throw new BadRequest("You are not authorized to delete this request");
    }
    await leave.deleteOne();
    res.json({ msg: "Leave request deleted successfully" });
  }),
);

// GET /leave/count/pending – count of pending leave requests accessible to user
router.get(
  "/count/pending",
  allowRoles("HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id } = req.user;
    let query: any = { status: "PENDING" };

    if (role === "STUDENT") {
      query = { "user.id": _id, status: "PENDING" };
    } else if (role === "FACULTY") {
      // Faculty sees their own pending requests
      query = { "user.id": _id, status: "PENDING" };
    } else if (role === "HOD") {
      // HOD sees pending from faculty and students
      query = { "user.role": { $in: ["faculty", "student"] }, status: "PENDING" };
    }
    // Admin not needed here

    const count = await LeaveRequest.countDocuments(query);
    res.json({ count });
  })
);

export default router;
