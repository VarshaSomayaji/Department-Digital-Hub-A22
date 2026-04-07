import { Router, Request, Response} from "express";
import { Student } from "../models/student.model";
import { allowRoles } from "../middlewares/RoleGuard";
import asyncHandler from "../middlewares/AsyncHandler";
import { BadRequest } from "../customErrors";

const router = Router();

// GET /students?batch=...
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY"),
  asyncHandler(async (req:Request, res:Response) => 
    {
    const { batch } = req.query;
    if (!batch) {
      throw new BadRequest("Batch query parameter is required");
    }
    const students = await Student.find({ batch })
      .select("name rollNo email mobileNumber image") // select needed fields
      .sort({ rollNo: 1 });
    res.json(students);
  })
);

export default router;