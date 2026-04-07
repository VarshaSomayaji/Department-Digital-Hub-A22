import { param, body, query } from "express-validator";
import { RoleEnum as ROLES } from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone); // Extend dayjs with timezone plugin
// set dayjs to IST timezone
dayjs.tz.setDefault("Asia/Kolkata");

export const idValidater = [
  param("_id").isMongoId().withMessage("Id must be a valid mongo id"),
];

export const roleValidater = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleWithQParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),

  query("q").optional().isString().withMessage("Query must be a string"),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const forgotPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("New Password must be between 6 and 20 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];



export const taskValidator = [
  body("task")
    .notEmpty()
    .withMessage("Task title is required")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Task title must be between 3 and 200 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)"),

  body("department")
    .notEmpty()
    .withMessage("Department is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),

  body("status")
    .optional()
    .isIn(["Pending", "Assigned", "In Progress", "Under Review", "Completed", "Cancelled"])
    .withMessage("Invalid status value"),

  body("employee")
    .optional()
    .isMongoId()
    .withMessage("Invalid employee ID format")
];

export const taskUpdateValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid task ID format"),

  body("task")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Task title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)"),

  body("status")
    .optional()
    .isIn(["Pending", "Assigned", "In Progress", "Under Review", "Completed", "Cancelled"])
    .withMessage("Invalid status value"),

  body("department")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),

  body("employee")
    .optional()
    .isMongoId()
    .withMessage("Invalid employee ID format")
];

export const solutionValidator = [
  body("solution")
    .notEmpty()
    .withMessage("Solution is required")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Solution must be at least 10 characters"),

  body("employeeId")
    .notEmpty()
    .withMessage("Employee ID is required")
    .isMongoId()
    .withMessage("Invalid employee ID format")
];

export const assignTaskValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid task ID format"),

  body("employeeId")
    .notEmpty()
    .withMessage("Employee ID is required")
    .isMongoId()
    .withMessage("Invalid employee ID format")
];

export const taskStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Pending", "Assigned", "In Progress", "Under Review", "Completed", "Cancelled"])
    .withMessage("Invalid status value")
];
