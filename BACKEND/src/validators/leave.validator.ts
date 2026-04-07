import { body } from "express-validator";

export const createLeaveValidator = [
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").isISO8601().withMessage("Valid end date required"),
  body("reason").notEmpty().withMessage("Reason is required"),
];

export const updateLeaveStatusValidator = [
  body("status").isIn(["APPROVED", "REJECTED"]).withMessage("Status must be APPROVED or REJECTED"),
];