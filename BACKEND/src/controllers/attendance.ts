import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Attendance } from "../models/attendance.model";
import { Student } from "../models/student.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createAttendanceValidator } from "../validators/attendance.validator";
import { BadRequest } from "../customErrors";

const router = Router();

// Post attendance (Faculty only)
router.post(
  "/",
  allowRoles("FACULTY"),
  validate(createAttendanceValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { date, subject, batch, records } = req.body;
    // Check if attendance already exists for that date, subject, batch, faculty
    const existing = await Attendance.findOne({
      date: new Date(date),
      faculty: req.user._id,
      subject,
      batch,
    });
    if (existing) {
      throw new BadRequest("Attendance already recorded for this class");
    }
    // Verify that all students exist in the batch
    const studentIds = records.map((r: any) => r.student);
    const students = await Student.find({ _id: { $in: studentIds }, batch });
    if (students.length !== studentIds.length) {
      throw new BadRequest("Some students not found or not in the specified batch");
    }
    const attendance = await Attendance.create({
      date,
      faculty: req.user._id,
      subject,
      batch,
      records,
    });
    res.status(201).json(attendance);
  })
);

// Get attendance (filtered by role)
// For faculty: can view their own attendance records
// For HOD/Admin: can view all, optionally filtered by batch/subject
// For student: can view their own attendance (by student id)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id } = req.user;
    const { batch, subject, studentId, startDate, endDate } = req.query;
    let query: any = {};

    if (role === "FACULTY") {
      query.faculty = _id;
    } else if (role === "STUDENT") {
      // Student can only see records where they appear
      query["records.student"] = _id;
    }
    // Additional filters
    if (batch) query.batch = batch;
    if (subject) query.subject = subject;
    if (studentId && (role === "ADMIN" || role === "HOD" || role === "FACULTY")) {
      query["records.student"] = studentId;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const attendances = await Attendance.find(query)
      .populate("faculty", "name email")
      .populate("records.student", "name rollNo")
      .sort({ date: -1 });
    res.json(attendances);
  })
);

// Get attendance by ID
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const attendance = await Attendance.findById(req.params.id)
      .populate("faculty", "name email")
      .populate("records.student", "name rollNo");
    if (!attendance) throw new BadRequest("Attendance record not found");
    // Check authorization
    const { role, _id } = req.user;
    if (role === "FACULTY" && attendance.faculty.toString() !== _id.toString()) {
      throw new BadRequest("You are not authorized to view this record");
    }
    if (role === "STUDENT") {
      const studentInRecord = attendance.records.some(r => r.student._id.toString() === _id.toString());
      if (!studentInRecord) throw new BadRequest("You are not authorized to view this record");
    }
    res.json(attendance);
  })
);

// Update attendance (only faculty who created it or admin)
router.patch(
  "/:id",
  allowRoles("FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) throw new BadRequest("Attendance record not found");
    if (req.user.role !== "ADMIN" && attendance.faculty.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to update this record");
    }
    const { records } = req.body;
    if (records) {
      // Validate records if needed
      attendance.records = records;
    }
    await attendance.save();
    res.json(attendance);
  })
);

// Delete attendance (only faculty who created it or admin)
router.delete(
  "/:id",
  allowRoles("FACULTY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) throw new BadRequest("Attendance record not found");
    if (req.user.role !== "ADMIN" && attendance.faculty.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this record");
    }
    await attendance.deleteOne();
    res.json({ msg: "Attendance record deleted successfully" });
  })
);

// GET /attendance/my/stats – attendance summary for logged-in student
router.get(
  "/my/stats",
  allowRoles("STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user._id;

    const stats = await Attendance.aggregate([
      { $unwind: "$records" },
      { $match: { "records.student": studentId } },
      {
        $group: {
          _id: "$subject",
          present: {
            $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$records.status", "Late"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = stats.map((item: any) => ({
      subject: item._id,
      present: item.present,
      absent: item.absent,
      late: item.late,
      total: item.total,
    }));

    res.json(formatted);
  })
);

export default router;