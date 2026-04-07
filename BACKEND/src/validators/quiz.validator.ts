import { body, param } from "express-validator";

// ----------------------------------------------------------------------
// Helper to validate questions array
// ----------------------------------------------------------------------
const validateQuestions = (value: any) => {
  if (!Array.isArray(value)) {
    throw new Error("Questions must be an array");
  }
  if (value.length === 0) {
    throw new Error("At least one question is required");
  }
  value.forEach((q: any, index: number) => {
    if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
      throw new Error(`Question ${index + 1}: question text is required`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question ${index + 1}: at least two options are required`);
    }
    q.options.forEach((opt: any) => {
      if (typeof opt !== "string" || opt.trim() === "") {
        throw new Error(`Question ${index + 1}: all options must be non-empty strings`);
      }
    });
    if (q.correctOption === undefined || q.correctOption === null) {
      throw new Error(`Question ${index + 1}: correctOption is required`);
    }
    const correctIdx = Number(q.correctOption);
    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= q.options.length) {
      throw new Error(`Question ${index + 1}: correctOption must be a valid index (0-${q.options.length - 1})`);
    }
  });
  return true;
};

// ----------------------------------------------------------------------
// CREATE QUIZ VALIDATOR
// ----------------------------------------------------------------------
export const createQuizValidator = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isString().withMessage("Title must be a string")
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("subject")
    .notEmpty().withMessage("Subject is required")
    .isString().withMessage("Subject must be a string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Subject must be between 2 and 100 characters"),

  body("batch")
    .notEmpty().withMessage("Batch is required")
    .isString().withMessage("Batch must be a string")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Batch must be between 2 and 50 characters"),

  body("questions")
    .notEmpty().withMessage("Questions are required")
    .custom(validateQuestions),

  body("duration")
    .notEmpty().withMessage("Duration is required")
    .isInt({ min: 1 }).withMessage("Duration must be a positive integer (minutes)"),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .isISO8601().withMessage("Start time must be a valid ISO 8601 date")
    .toDate(),

  body("endTime")
    .notEmpty().withMessage("End time is required")
    .isISO8601().withMessage("End time must be a valid ISO 8601 date")
    .toDate()
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),
];

// ----------------------------------------------------------------------
// UPDATE QUIZ VALIDATOR (all fields optional)
// ----------------------------------------------------------------------
export const updateQuizValidator = [
  param("id")
    .isMongoId().withMessage("Invalid quiz ID"),

  body("title")
    .optional()
    .isString().withMessage("Title must be a string")
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("subject")
    .optional()
    .isString().withMessage("Subject must be a string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Subject must be between 2 and 100 characters"),

  body("batch")
    .optional()
    .isString().withMessage("Batch must be a string")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Batch must be between 2 and 50 characters"),

  body("questions")
    .optional()
    .custom(validateQuestions),

  body("duration")
    .optional()
    .isInt({ min: 1 }).withMessage("Duration must be a positive integer (minutes)"),

  body("startTime")
    .optional()
    .isISO8601().withMessage("Start time must be a valid ISO 8601 date")
    .toDate(),

  body("endTime")
    .optional()
    .isISO8601().withMessage("End time must be a valid ISO 8601 date")
    .toDate()
    .custom((endTime, { req }) => {
      if (req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),
];

// ----------------------------------------------------------------------
// SUBMIT QUIZ VALIDATOR
// ----------------------------------------------------------------------
export const submitQuizValidator = [
  param("id")
    .isMongoId().withMessage("Invalid quiz ID"),

  body("answers")
    .notEmpty().withMessage("Answers are required")
    .isArray().withMessage("Answers must be an array")
    .custom((answers) => {
      if (!Array.isArray(answers)) return false;
      if (answers.length === 0) {
        throw new Error("At least one answer is required");
      }
      answers.forEach((ans: any, idx: number) => {
        if (ans.questionIndex === undefined || ans.questionIndex === null) {
          throw new Error(`Answer ${idx + 1}: questionIndex is required`);
        }
        if (typeof ans.questionIndex !== "number" || ans.questionIndex < 0) {
          throw new Error(`Answer ${idx + 1}: questionIndex must be a non-negative integer`);
        }
        if (ans.selectedOption === undefined || ans.selectedOption === null) {
          throw new Error(`Answer ${idx + 1}: selectedOption is required`);
        }
        if (typeof ans.selectedOption !== "number" || ans.selectedOption < 0) {
          throw new Error(`Answer ${idx + 1}: selectedOption must be a non-negative integer`);
        }
      });
      return true;
    }),
];