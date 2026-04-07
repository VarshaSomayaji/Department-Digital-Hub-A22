import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { PlacementDrive } from "../models/placementDrive.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import { createPlacementValidator } from "../validators/placement.validator";
import { BadRequest } from "../customErrors";
import { getModelByRole, uploadLocal } from "../constants/lib";
import CONFIG from "../config";

const router = Router();

// Create placement drive (Admin, HOD)
router.post(
  "/",
  allowRoles("ADMIN", "HOD"),
  uploadLocal.array("attachments"), // Parse files under field name "attachments"
  validate(createPlacementValidator), // Validation runs after multer populates req.body
  asyncHandler(async (req: Request, res: Response) => {
    const { companyName, jobProfile, description, eligibility, lastDateToApply, driveDate } = req.body;
    const files = req.files as Express.Multer.File[];

    // Generate URLs for uploaded files
    const attachmentUrls = files
      ? files.map((file) => `${CONFIG.HOST}/static/uploads/${file.filename}`)
      : [];

    const drive = await PlacementDrive.create({
      companyName,
      jobProfile,
      description,
      eligibility,
      lastDateToApply,
      driveDate,
      postedBy: { role: req.user.role, id: req.user._id },
      attachments: attachmentUrls,
    });

    res.status(201).json(drive);
  })
);

// Get all placement drives (visible to all logged in users)
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const drives = await PlacementDrive.find().lean();
    for (const dri of drives){
      const role = dri.postedBy.role;
      const model = getModelByRole(role) as any;

      if(model){
        const user = await model.findById(dri.postedBy.id).select('name email');
        dri.postedBy.id = user;
      }
    }
    res.json(drives);
  })
);

// Get single placement drive
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const drive = await PlacementDrive.findById(id).lean();

    if (!drive) {
      throw new BadRequest("Placement drive not found");
    }

    const role = drive.postedBy.role;
    const model = getModelByRole(role) as any;

    if (model && drive.postedBy.id) {
      const user = await model
        .findById(drive.postedBy.id)
        .select('name email')
        .lean();

      drive.postedBy = {
        ...drive.postedBy,        
      };
    }

    res.json(drive);
  })
);

// Update placement drive (only poster or admin)
router.patch(
  "/:id",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) throw new BadRequest("Placement drive not found");
    if (req.user.role !== "ADMIN" && drive.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to update this drive");
    }
    const updates = req.body;
    Object.assign(drive, updates);
    await drive.save();
    res.json(drive);
  })
);

// Delete placement drive (only poster or admin)
router.delete(
  "/:id",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) throw new BadRequest("Placement drive not found");
    if (req.user.role !== "ADMIN" && drive.postedBy.id.toString() !== req.user._id.toString()) {
      throw new BadRequest("You are not authorized to delete this drive");
    }
    await drive.deleteOne();
    res.json({ msg: "Placement drive deleted successfully" });
  })
);

export default router;