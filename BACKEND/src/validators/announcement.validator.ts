import { body } from "express-validator";

export const createAnnouncementValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("targetAudience")
    .isArray({ min: 1 })
    .withMessage("Target audience must be a non-empty array")
    .custom((value) => {
      const allowed = ["ADMIN", "HOD", "FACULTY", "STUDENT"];
      if (!value.every((v: string) => allowed.includes(v))) {
        throw new Error("Invalid role in targetAudience");
      }
      return true;
    }),
];

export const updateAnnouncementValidator = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("targetAudience")
    .optional()
    .isArray()
    .withMessage("Target audience must be an array")
    .custom((value) => {
      const allowed = ["ADMIN", "HOD", "FACULTY", "STUDENT"];
      if (!value.every((v: string) => allowed.includes(v))) {
        throw new Error("Invalid role in targetAudience");
      }
      return true;
    }),
];