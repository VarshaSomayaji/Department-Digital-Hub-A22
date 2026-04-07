import { Request, Response, Router } from "express";
import { Quiz } from "../models/quiz.model";
import asyncHandler from "../middlewares/AsyncHandler";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import {
  createQuizValidator,
  updateQuizValidator,
  submitQuizValidator,
} from "../validators/quiz.validator";
import { BadRequest, Forbidden, NotFound } from "../customErrors";
import { Types } from "mongoose";
import { Student } from "../models";

const router = Router();

// ----------------------------------------------------------------------
// CREATE QUIZ (Faculty only)
// ----------------------------------------------------------------------
router.post(
  "/",
  allowRoles("FACULTY"),
  validate(createQuizValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, subject, batch, questions, duration, startTime, endTime } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      batch,
      faculty: req.user._id,
      questions,
      duration,
      startTime,
      endTime,
    });

    res.status(201).json(quiz);
  })
);

// ----------------------------------------------------------------------
// GET ALL QUIZZES (filtered by role)
// ----------------------------------------------------------------------
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id: userId } = req.user;
    const { batch, subject } = req.query;

    let filter: any = {};

    if (batch) filter.batch = batch;
    if (subject) filter.subject = subject;

    // Role-based filtering
    if (role === "FACULTY") {
      filter.faculty = userId; 
    } 
    
    let query = Quiz.find(filter).populate("faculty", "name email");

    // If user is student, exclude correct answers
    if (role === "STUDENT") {
      query = query.select("-questions.correctOption");
    }

    const quizzes = await query.sort({ createdAt: -1 }).lean();

    res.json(quizzes);
  })
);

// ----------------------------------------------------------------------
// GET QUIZ BY ID
// ----------------------------------------------------------------------
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    let query = Quiz.findById(id).populate("faculty", "name email");

    // Hide correct answers from students
    if (role === "STUDENT") {
      query = query.select("-questions.correctOption");
    }

    const quiz = await query.lean();

    if (!quiz) {
      throw new NotFound("Quiz not found");
    }

    // Check access: faculty can only see their own quizzes (unless admin/hod)
    if (role === "FACULTY" && quiz.faculty._id.toString() !== userId.toString()) {
      throw new Forbidden("You can only view your own quizzes");
    }

    // Students can only see quizzes for their batch (we assume frontend sends batch filter, but double-check)
    // Additional check: ensure the quiz is active for students
    if (role === "STUDENT") {
      const now = new Date();
      if (now < quiz.startTime || now > quiz.endTime) {
        throw new Forbidden("Quiz is not currently active");
      }
    }

    res.json(quiz);
  })
);

// ----------------------------------------------------------------------
// UPDATE QUIZ (Faculty only - owner)
// ----------------------------------------------------------------------
router.patch(
  "/:id",
  allowRoles("FACULTY"),
  validate(updateQuizValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFound("Quiz not found");
    }

    // Check ownership
    if (quiz.faculty.toString() !== req.user._id.toString()) {
      throw new Forbidden("You can only update your own quizzes");
    }

    // Prevent updating certain fields if results exist
    if (quiz.results.length > 0) {
      const forbidden = ["questions", "startTime", "endTime", "duration"];
      for (const field of forbidden) {
        if (updates[field] !== undefined) {
          throw new BadRequest(`Cannot update ${field} after students have submitted`);
        }
      }
    }

    Object.assign(quiz, updates);
    await quiz.save();

    res.json(quiz);
  })
);

// ----------------------------------------------------------------------
// DELETE QUIZ (Faculty only - owner)
// ----------------------------------------------------------------------
router.delete(
  "/:id",
  allowRoles("FACULTY"),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFound("Quiz not found");
    }

    if (quiz.faculty.toString() !== req.user._id.toString()) {
      throw new Forbidden("You can only delete your own quizzes");
    }

    await quiz.deleteOne();

    res.json({ msg: "Quiz deleted successfully" });
  })
);

// ----------------------------------------------------------------------
// SUBMIT QUIZ (Student only)
// ----------------------------------------------------------------------
router.post(
  "/:id/submit",
  allowRoles("STUDENT"),
  validate(submitQuizValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { answers } = req.body; // array of { questionIndex, selectedOption }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFound("Quiz not found");
    }

    // Check if quiz is active
    const now = new Date();
    if (now < quiz.startTime || now > quiz.endTime) {
      throw new BadRequest("Quiz is not currently active");
    }

    // Check if student already submitted
    const alreadySubmitted = quiz.results.some(
      (r) => r.student.toString() === req.user._id.toString()
    );
    if (alreadySubmitted) {
      throw new BadRequest("You have already submitted this quiz");
    }

    // Calculate score
    let score = 0;
    for (const answer of answers) {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.correctOption === answer.selectedOption) {
        score++;
      }
    }

    // Add result
    quiz.results.push({
      student: req.user._id as any, // cast to satisfy TypeScript
      score,
      submittedAt: new Date(),
    });

    await quiz.save();
    const total = quiz.questions.length;
    const percentage = (score/total) * 100; 
    res.json({
      msg: "Quiz submitted successfully",
      score,
      total,
      percentage
    });
  })
);

// ----------------------------------------------------------------------
// GET RESULTS for a quiz (Faculty, HOD, Admin)
// ----------------------------------------------------------------------
router.get(
  "/:id/results",
  allowRoles("ADMIN", "HOD", "FACULTY"),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate("results.student", "name rollNo")
      .lean();

    if (!quiz) {
      throw new NotFound("Quiz not found");
    }

    // Faculty can only see results of their own quizzes
    if (req.user.role === "FACULTY" && quiz.faculty.toString() !== req.user._id.toString()) {
      throw new Forbidden("You can only view results of your own quizzes");
    }

    const totalQuestions = quiz.questions.length;

    res.json({
      quizTitle: quiz.title,
      totalQuestions,
      results: quiz.results,
    });
  })
);


// GET /quizzes/upcoming?limit=5 – get upcoming quizzes for student
router.get(
  "/upcoming",
  allowRoles("STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const student = await Student.findById(req.user._id);
    if (!student) throw new BadRequest("Student not found");

    const now = new Date();
    const quizzes = await Quiz.find({
      batch: student.batch,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .select("-questions.correctOption")
      .populate("faculty", "name")
      .limit(limit)
      .sort({ endTime: 1 });

    res.json(quizzes);
  })
);

export default router;