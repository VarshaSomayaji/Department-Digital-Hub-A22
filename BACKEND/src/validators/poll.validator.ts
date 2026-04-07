import { body, param } from "express-validator";
import { RoleEnum } from "../types";

export const createPollValidator = [
  body("question")
    .notEmpty()
    .withMessage("Question is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Question must be between 5 and 500 characters"),

  body("options")
    .isArray({ min: 2, max: 10 })
    .withMessage("Options must be an array with 2 to 10 items")
    .custom((options: string[]) => {
      if (options.some((opt) => opt.trim().length === 0)) {
        throw new Error("Options cannot be empty");
      }
      return true;
    }),

  body("targetAudience")
    .isArray({ min: 1 })
    .withMessage("Target audience must be an array with at least one role")
    .custom((roles: string[]) => {
      const validRoles = Object.values(RoleEnum);
      if (roles.some((r) => !validRoles.includes(r as any))) {
        throw new Error(`Invalid role in targetAudience. Valid roles: ${validRoles.join(", ")}`);
      }
      return true;
    }),

  body("expiresAt")
    .notEmpty()
    .withMessage("Expiration date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Expiration date must be in the future");
      }
      return true;
    }),
];

export const updatePollValidator = [
  param("id").isMongoId().withMessage("Invalid poll ID"),

  body("question")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Question must be between 5 and 500 characters"),

  body("options")
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage("Options must be an array with 2 to 10 items")
    .custom((options: string[]) => {
      if (options.some((opt) => opt.trim().length === 0)) {
        throw new Error("Options cannot be empty");
      }
      return true;
    }),

  body("targetAudience")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Target audience must be an array with at least one role")
    .custom((roles: string[]) => {
      const validRoles = Object.values(RoleEnum);
      if (roles.some((r) => !validRoles.includes(r as any))) {
        throw new Error(`Invalid role in targetAudience. Valid roles: ${validRoles.join(", ")}`);
      }
      return true;
    }),

  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Expiration date must be in the future");
      }
      return true;
    }),
];

export const respondPollValidator = [
  param("id").isMongoId().withMessage("Invalid poll ID"),
  body("selectedOption").notEmpty().withMessage("Selected option is required"),
];

export const idParamValidator = [param("id").isMongoId().withMessage("Invalid ID format")];