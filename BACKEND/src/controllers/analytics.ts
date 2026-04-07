import { Request, Response, Router } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { allowRoles } from "../middlewares/RoleGuard";
import { Admin, HOD, Faculty, Student } from "../models";
import { Project } from "../models/project.model";
import { Attendance } from "../models/attendance.model";
import { Quiz } from "../models/quiz.model";
import { BadRequest } from "../customErrors";

const router = Router();

// ----------------------------------------------------------------------
// User Statistics
// ----------------------------------------------------------------------
router.get(
  "/users",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const [adminCount, hodCount, facultyCount, studentCount] = await Promise.all([
      Admin.countDocuments(),
      HOD.countDocuments(),
      Faculty.countDocuments(),
      Student.countDocuments(),
    ]);

    const total = adminCount + hodCount + facultyCount + studentCount;

    res.json({
      totalUsers: total,
      byRole: {
        ADMIN: adminCount,
        HOD: hodCount,
        FACULTY: facultyCount,
        STUDENT: studentCount,
      },
    });
  })
);

// ----------------------------------------------------------------------
// Project Domains (optionally filtered by year)
// ----------------------------------------------------------------------
router.get(
  "/projects/domains",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const { year } = req.query;

    const matchStage: any = {};
    if (year) {
      const yearNum = parseInt(year as string);
      if (isNaN(yearNum)) throw new BadRequest("Invalid year parameter");
      matchStage.year = yearNum;
    }

    const result = await Project.aggregate([
      { $match: matchStage },
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const domainStats = result.map((item) => ({
      domain: item._id || "Uncategorized",
      count: item.count,
    }));

    res.json(domainStats);
  })
);

// ----------------------------------------------------------------------
// Top Technologies Used in Projects
// ----------------------------------------------------------------------
router.get(
  "/projects/technologies",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await Project.aggregate([
      { $unwind: "$techStack" },
      { $group: { _id: "$techStack", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }, // top 20 technologies
    ]);

    const techStats = result.map((item) => ({
      tech: item._id,
      count: item.count,
    }));

    res.json(techStats);
  })
);

// ----------------------------------------------------------------------
// Projects per Year
// ----------------------------------------------------------------------
router.get(
  "/projects/yearly",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await Project.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const yearlyStats = result.map((item) => ({
      year: item._id,
      count: item.count,
    }));

    res.json(yearlyStats);
  })
);

// ----------------------------------------------------------------------
// Attendance Summary (by batch and subject)
// ----------------------------------------------------------------------
router.get(
  "/attendance/summary",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const { batch, subject } = req.query;

    const matchStage: any = {};
    if (batch) matchStage.batch = batch;
    if (subject) matchStage.subject = subject;

    const result = await Attendance.aggregate([
      { $match: matchStage },
      { $unwind: "$records" },
      {
        $group: {
          _id: {
            batch: "$batch",
            subject: "$subject",
            date: "$date",
          },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ["$records.status", ["Present", "Late"]] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: { batch: "$_id.batch", subject: "$_id.subject" },
          avgAttendance: { $avg: { $multiply: [{ $divide: ["$present", "$total"] }, 100] } },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { "_id.batch": 1, "_id.subject": 1 } },
    ]);

    const summary = result.map((item) => ({
      batch: item._id.batch,
      subject: item._id.subject,
      averageAttendance: parseFloat(item.avgAttendance.toFixed(2)),
    }));

    res.json(summary);
  })
);

// ----------------------------------------------------------------------
// Quiz Performance Metrics
// ----------------------------------------------------------------------
router.get(
  "/quizzes/performance",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const quizzes = await Quiz.find().populate("results.student", "name").lean();

    const performance = quizzes.map((quiz) => {
      const totalAttempts = quiz.results.length;
      if (totalAttempts === 0) {
        return {
          quizId: quiz._id.toString(),
          title: quiz.title,
          averageScore: 0,
          totalAttempts: 0,
          passRate: 0,
        };
      }

      const totalScore = quiz.results.reduce((sum, r) => sum + r.score, 0);
      const averageScore = totalScore / totalAttempts;
      const maxPossibleScore = quiz.questions.length; // assuming each question 1 mark
      const passThreshold = maxPossibleScore * 0.4; // 40% as pass mark
      const passed = quiz.results.filter((r) => r.score >= passThreshold).length;
      const passRate = (passed / totalAttempts) * 100;

      return {
        quizId: quiz._id.toString(),
        title: quiz.title,
        averageScore,
        totalAttempts,
        passRate,
      };
    });

    res.json(performance);
  })
);

export default router;