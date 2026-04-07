import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Announcement } from "../models/announcement.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createAnnouncementValidator, updateAnnouncementValidator } from "../validators/announcement.validator";
import { BadRequest } from "../customErrors";
import { idValidater } from "../validators";
import { getModelByRole } from "../constants/lib";

const router = Router();

// Create announcement (Admin, HOD, Faculty)
router.post(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY"),
  validate(createAnnouncementValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, targetAudience } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      postedBy: { 
        role: req.user.role, 
        id: req.user._id },
      targetAudience,
    });
    res.status(201).json(announcement);
  })
);

// Get all announcements (filtered by user role)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user.role;
    let query = {};
    if (userRole !== "ADMIN") {
      query = { targetAudience: { $in: [userRole] } };
    }
    const announcements = await Announcement.find(query).lean();
    // Manually populate postedBy
    for (const ann of announcements) {
      const role = ann.postedBy.role;
      const model = getModelByRole(role) as any; // use your existing helper
      if (model) {
        const user = await model.findById(ann.postedBy.id).select('name email');
        ann.postedBy.id = user;
      }
    }
    res.json(announcements);
  })
);

// Get single announcement
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const announcement = await Announcement.findById(req.params.id).lean();
    if (!announcement) throw new BadRequest("Announcement not found");
    // Manually populate postedBy
    const role = announcement.postedBy.role;
    const model = getModelByRole(role) as any;
    if (model) {
      const user = await model.findById(announcement.postedBy.id).select('name email');
      announcement.postedBy.id = user;
    }
    // Check if user can view (if not admin, must be in targetAudience)
    if (req.user.role !== "ADMIN" && !announcement.targetAudience.includes(req.user.role)) {
      throw new BadRequest("You are not authorized to view this announcement");
    }
    res.json(announcement);
  })
);

// PATCH /announcements/:id/seen - mark as seen by current user
router.patch(
  "/:id/seen",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new BadRequest("Announcement not found");
    }

    // Check if already seen
    const alreadySeen = announcement.seenBy.some(
      (entry) => entry.user.id.toString() === userId.toString() && entry.user.role === role
    );
    if (!alreadySeen) {
      announcement.seenBy.push({
        user: { role, id: userId as any },
        seenAt: new Date(),
      });
      await announcement.save();
    }

    res.json({ msg: "Marked as seen" });
  })
);

// Update announcement (only the poster or admin)
router.patch(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY"),
  validate(updateAnnouncementValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new BadRequest("Announcement not found");
    // Check if user is the poster or admin
    if (req.user.role !== "ADMIN" && announcement.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to update this announcement");
    }
    const { title, content, targetAudience } = req.body;
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (targetAudience) announcement.targetAudience = targetAudience;
    await announcement.save();
    res.json(announcement);
  })
);

// Delete announcement (only the poster or admin)
router.delete(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY"),
  asyncHandler(async (req: Request, res: Response) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new BadRequest("Announcement not found");
    if (req.user.role !== "ADMIN" && announcement.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this announcement");
    }
    await announcement.deleteOne();
    res.json({ msg: "Announcement deleted successfully" });
  })
);

export default router;