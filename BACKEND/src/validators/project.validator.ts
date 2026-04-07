import { body } from "express-validator";

export const createProjectValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("year")
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage("Year must be a valid year"),
];

export const updateProjectValidator = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  body("year")
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage("Year must be a valid year"),
  body("domain").optional(),
  body("techStack").optional(),
  body("keywords").optional(),
  body("summary").optional(),
  body("tags").optional(),
];