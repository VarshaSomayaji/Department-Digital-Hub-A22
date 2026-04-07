import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { ClassroomUpdate } from "../models/classroomUpdate.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createClassroomUpdateValidator } from "../validators/classroom.validator";
import { uploadLocal } from "../constants/lib";
import CONFIG from "../config";
import { BadRequest } from "../customErrors";

const router = Router();

// Post classroom update (Faculty or HOD) with optional attachments
// Post classroom update (Faculty or HOD) with optional attachments
router.post(
  "/",
  allowRoles("FACULTY", "HOD"),
  uploadLocal.array("attachments"), // Parse multipart with field "attachments"
  validate(createClassroomUpdateValidator), // Validation runs after multer populates req.body
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, batch } = req.body;
    const files = req.files as Express.Multer.File[];

    // Generate URLs for uploaded files
    const attachmentUrls = files
      ? files.map((file) => `${CONFIG.HOST}/static/uploads/${file.filename}`)
      : [];

    const update = await ClassroomUpdate.create({
      title,
      content,
      batch,
      // Convert role to lowercase to match model names
      postedBy: { role: req.user.role.toLowerCase(), id: req.user._id },
      attachments: attachmentUrls,
    });
    res.status(201).json(update);
  })
);

// Get classroom updates (filter by batch)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { batch } = req.query;
    let query: any = {};
    if (batch) query.batch = batch;
    const updates = await ClassroomUpdate.find(query)
      .populate("postedBy.id", "name email")
      .sort({ createdAt: -1 });
    res.json(updates);
  })
);

// Get single update
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const update = await ClassroomUpdate.findById(req.params.id)
      .populate("postedBy.id", "name email");
    if (!update) throw new BadRequest("Classroom update not found");
    res.json(update);
  })
);

// Update (only poster or admin) – no file upload in update
router.patch(
  "/:id",
  allowRoles("FACULTY", "HOD", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const update = await ClassroomUpdate.findById(req.params.id);
    if (!update) throw new BadRequest("Classroom update not found");
    if (req.user.role !== "ADMIN" && update.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to update this update");
    }
    const { title, content, batch } = req.body;
    if (title) update.title = title;
    if (content) update.content = content;
    if (batch) update.batch = batch;
    await update.save();
    res.json(update);
  })
);

// Delete (only poster or admin)
router.delete(
  "/:id",
  allowRoles("FACULTY", "HOD", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const update = await ClassroomUpdate.findById(req.params.id);
    if (!update) throw new BadRequest("Classroom update not found");
    if (req.user.role !== "ADMIN" && update.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this update");
    }
    await update.deleteOne();
    res.json({ msg: "Classroom update deleted successfully" });
  })
);

export default router;