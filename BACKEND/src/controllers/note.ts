import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Note } from "../models/note.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createNoteValidator } from "../validators/note.validator";
import { uploadLocal, removeFile } from "../constants/lib";
import CONFIG from "../config";
import { BadRequest } from "../customErrors";

const router = Router();

// Upload note (Faculty only)
router.post(
  "/",
  allowRoles("FACULTY"),
  uploadLocal.single("note"), // ← changed from "file" to "note"
  validate(createNoteValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, subject, batch } = req.body;
    const file = req.file;
    if (!file) {
      throw new BadRequest("File is required");
    }
    const fileUrl = `${CONFIG.HOST}/static/uploads/${file.filename}`;
    const note = await Note.create({
      title,
      description,
      subject,
      batch,
      fileUrl,
      uploadedBy: { role: "FACULTY", id: req.user._id },
    });
    res.status(201).json(note);
  })
);

// Get notes (filtered by batch, subject)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { batch, subject } = req.query;
    let query: any = {};
    if (batch) query.batch = batch;
    if (subject) query.subject = subject;
    const notes = await Note.find(query)
      .populate("uploadedBy.id", "name email")
      .sort({ createdAt: -1 });
    res.json(notes);
  })
);

// Get single note
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const note = await Note.findById(req.params.id)
      .populate("uploadedBy.id", "name email");
    if (!note) throw new BadRequest("Note not found");
    res.json(note);
  })
);

// Delete note (uploader or admin)
router.delete(
  "/:id",
  allowRoles("FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const note = await Note.findById(req.params.id);
    if (!note) throw new BadRequest("Note not found");
    if (req.user.role !== "ADMIN" && note.uploadedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this note");
    }
    // Optionally delete file from storage
    await note.deleteOne();
    res.json({ msg: "Note deleted successfully" });
  })
);

export default router;