import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Marks } from "../models/marks.model";
import { Student } from "../models/student.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createMarksValidator } from "../validators/marks.validator";
import { BadRequest } from "../customErrors";

const router = Router();

// Post marks (Faculty only)
router.post(
  "/",
  allowRoles("FACULTY"),
  validate(createMarksValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { examName, subject, batch, maxMarks, marksObtained } = req.body;
    // Check if marks already exist for that exam, subject, batch
    const existing = await Marks.findOne({ examName, subject, batch, faculty: req.user._id });
    if (existing) {
      throw new BadRequest("Marks already recorded for this exam");
    }
    // Verify students
    const studentIds = marksObtained.map((m: any) => m.student);
    const students = await Student.find({ _id: { $in: studentIds }, batch });
    if (students.length !== studentIds.length) {
      throw new BadRequest("Some students not found or not in the specified batch");
    }
    const marks = await Marks.create({
      examName,
      subject,
      batch,
      faculty: req.user._id,
      maxMarks,
      marksObtained,
    });
    res.status(201).json(marks);
  })
);

// Get marks (filtered by role)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id } = req.user;
    const { batch, subject, studentId, examName } = req.query;
    let query: any = {};

    if (role === "FACULTY") {
      query.faculty = _id;
    } else if (role === "STUDENT") {
      query["marksObtained.student"] = _id;
    }
    if (batch) query.batch = batch;
    if (subject) query.subject = subject;
    if (examName) query.examName = examName;
    if (studentId && (role === "ADMIN" || role === "HOD" || role === "FACULTY")) {
      query["marksObtained.student"] = studentId;
    }

    const marks = await Marks.find(query)
      .populate("faculty", "name email")
      .populate("marksObtained.student", "name rollNo")
      .sort({ createdAt: -1 });
    res.json(marks);
  })
);

// Get marks by ID
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const marks = await Marks.findById(req.params.id)
      .populate("faculty", "name email")
      .populate("marksObtained.student", "name rollNo");
    if (!marks) throw new BadRequest("Marks record not found");
    const { role, _id } = req.user;
    if (role === "FACULTY" && marks.faculty.toString() !== _id.toString()) {
      throw new BadRequest("You are not authorized to view this record");
    }
    if (role === "STUDENT") {
      const studentInRecord = marks.marksObtained.some(m => m.student._id.toString() === _id.toString());
      if (!studentInRecord) throw new BadRequest("You are not authorized to view this record");
    }
    res.json(marks);
  })
);

// Update marks (only faculty who created it or admin)
router.patch(
  "/:id",
  allowRoles("FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const marks = await Marks.findById(req.params.id);
    if (!marks) throw new BadRequest("Marks record not found");
    if (req.user.role !== "ADMIN" && marks.faculty.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to update this record");
    }
    const updates = req.body;
    // Optionally validate marksObtained structure
    Object.assign(marks, updates);
    await marks.save();
    res.json(marks);
  })
);

// Delete marks (only faculty who created it or admin)
router.delete(
  "/:id",
  allowRoles("FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const marks = await Marks.findById(req.params.id);
    if (!marks) throw new BadRequest("Marks record not found");
    if (req.user.role !== "ADMIN" && marks.faculty.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this record");
    }
    await marks.deleteOne();
    res.json({ msg: "Marks record deleted successfully" });
  })
);

export default router;