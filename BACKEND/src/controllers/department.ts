import { Request, Response, Router } from "express";
import { HOD, Faculty, Student } from "../models";
import { Project } from "../models/project.model";
import { allowRoles } from "../middlewares/RoleGuard";
import asyncHandler from "../middlewares/AsyncHandler";
import { BadRequest } from "../customErrors";

const router = Router();

// GET /department/stats – get stats for HOD's department
router.get(
  "/stats",
  allowRoles("HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    // Find the HOD to get department
    const hod = await HOD.findById(req.user._id);
    if (!hod) throw new BadRequest("HOD not found");

    const department = hod.department;

    const [totalStudents, totalFaculty, totalProjects] = await Promise.all([
      Student.countDocuments({ department }),
      Faculty.countDocuments({ department }),
      Project.countDocuments({ "uploadedBy.role": "faculty", domain: department }), // Adjust if project has department field
    ]);

    res.json({
      totalStudents,
      totalFaculty,
      totalProjects,
      department,
    });
  })
);

export default router;