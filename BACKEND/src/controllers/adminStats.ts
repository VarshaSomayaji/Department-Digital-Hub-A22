import { Request, Response, Router } from "express";
import { Admin, HOD, Faculty, Student } from "../models";
import { allowRoles } from "../middlewares/RoleGuard";
import asyncHandler from "../middlewares/AsyncHandler";

const router = Router();

// GET /admin/stats/users – get counts of all user roles
router.get(
  "/users",
  allowRoles("ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const [totalAdmins, totalHODs, totalFaculty, totalStudents] = await Promise.all([
      Admin.countDocuments(),
      HOD.countDocuments(),
      Faculty.countDocuments(),
      Student.countDocuments(),
    ]);

    res.json({
      totalAdmins,
      totalHODs,
      totalFaculty,
      totalStudents,
      totalUsers: totalAdmins + totalHODs + totalFaculty + totalStudents,
    });
  })
);

// GET /admin/stats/growth?months=6 – user growth over time (by month)
router.get(
  "/growth",
  allowRoles("ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const months = parseInt(req.query.months as string) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // We need to aggregate across all user collections. For simplicity, we'll run separate aggregations.
    const models = [Admin, HOD, Faculty, Student];
    const roleNames = ["admins", "hods", "faculty", "students"];

    const results: Record<string, any> = {};

    for (let i = 0; i < models.length; i++) {
      const Model = models[i];
      const role = roleNames[i];
      const aggregation = await Model.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Format for chart: { month: "Jan 2026", count }
      aggregation.forEach((item: any) => {
        const monthName = new Date(item._id.year, item._id.month - 1, 1).toLocaleString('default', { month: 'short' });
        const key = `${monthName} ${item._id.year}`;
        if (!results[key]) {
          results[key] = { month: key, admins: 0, hods: 0, faculty: 0, students: 0, total: 0 };
        }
        results[key][role] = item.count;
        results[key].total += item.count;
      });
    }

    // Convert to array
    const growthData = Object.values(results);
    res.json(growthData);
  })
);

export default router;