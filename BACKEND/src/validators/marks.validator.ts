import { body } from "express-validator";

export const createMarksValidator = [
  body("examName").notEmpty().withMessage("Exam name is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("batch").notEmpty().withMessage("Batch is required"),
  body("maxMarks").isNumeric().withMessage("Max marks must be a number"),
  body("marksObtained").isArray({ min: 1 }).withMessage("At least one mark entry is required"),
  body("marksObtained.*.student").isMongoId().withMessage("Valid student ID required"),
  body("marksObtained.*.marks").isNumeric().withMessage("Marks must be a number"),
];