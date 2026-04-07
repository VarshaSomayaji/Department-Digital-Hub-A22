import { Request, Response, NextFunction } from "express";
import { _401 } from "../customErrors";

export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(_401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(_401).json({ message: "Insufficient permissions" });
    }
    next();
  };
};