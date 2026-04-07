import { body } from "express-validator";

export const createTimetableValidator = [
  body("batch").notEmpty().withMessage("Batch is required"),
  body("day")
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    .withMessage("Invalid day"),
  body("periods").isArray({ min: 1 }).withMessage("Periods must be a non-empty array"),
  body("periods.*.periodNumber")
    .isInt({ min: 1 })
    .withMessage("Period number must be a positive integer"),
  body("periods.*.subject").notEmpty().withMessage("Subject is required"),
  body("periods.*.faculty").isMongoId().withMessage("Valid faculty ID required"),
  body("periods.*.startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:MM)"),
  body("periods.*.endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:MM)"),
];

export const updateTimetableValidator = [
  body("batch").optional().notEmpty().withMessage("Batch cannot be empty"),
  body("day")
    .optional()
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    .withMessage("Invalid day"),
  body("periods").optional().isArray({ min: 1 }).withMessage("Periods must be a non-empty array"),
  body("periods.*.periodNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Period number must be a positive integer"),
  body("periods.*.subject").optional().notEmpty().withMessage("Subject cannot be empty"),
  body("periods.*.faculty").optional().isMongoId().withMessage("Valid faculty ID required"),
  body("periods.*.startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:MM)"),
  body("periods.*.endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:MM)"),
];