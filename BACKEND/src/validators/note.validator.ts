import { body } from "express-validator";

export const createNoteValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("batch").notEmpty().withMessage("Batch is required"),
];