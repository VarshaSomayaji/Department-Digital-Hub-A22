import { body } from "express-validator";

export const createAttendanceValidator = [
  body("date").isISO8601().withMessage("Valid date is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("batch").notEmpty().withMessage("Batch is required"),
  body("records").isArray({ min: 1 }).withMessage("At least one attendance record is required"),
  body("records.*.student").isMongoId().withMessage("Valid student ID required"),
  body("records.*.status").isIn(["Present", "Absent", "Late"]).withMessage("Invalid status"),
];