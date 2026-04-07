import { body } from "express-validator";

export const createPlacementValidator = [
  body("companyName").notEmpty().withMessage("Company name is required"),
  body("jobProfile").notEmpty().withMessage("Job profile is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("eligibility").notEmpty().withMessage("Eligibility criteria is required"),
  body("lastDateToApply").isISO8601().withMessage("Valid last date is required"),
  body("driveDate").isISO8601().withMessage("Valid drive date is required"),
];