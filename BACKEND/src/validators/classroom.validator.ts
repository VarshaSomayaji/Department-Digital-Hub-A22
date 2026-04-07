import { body } from "express-validator";

export const createClassroomUpdateValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("batch").notEmpty().withMessage("Batch is required"),
];