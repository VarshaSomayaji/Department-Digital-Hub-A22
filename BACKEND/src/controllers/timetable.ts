import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Timetable } from "../models/timetable.model";
import { Faculty } from "../models";
import { validate } from "../middlewares/Validator";
import {
  createTimetableValidator,
  updateTimetableValidator,
} from "../validators/timetable.validator";
import { BadRequest, Unauthorized } from "../customErrors";
import { RoleEnum } from "../types";
import { Types } from "mongoose";

const router = Router();

// ----------------------------------------------------------------------
// CREATE Timetable (Faculty only)
// ----------------------------------------------------------------------
router.post(
  "/",
  validate(createTimetableValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;

    // Only Faculty can create timetable
    if (role !== RoleEnum.FACULTY) {
      throw new Unauthorized("Only faculty can create timetable");
    }

    const { batch, day, periods } = req.body;

    // Check if timetable already exists for this batch and day
    const existing = await Timetable.findOne({ batch, day });
    if (existing) {
      throw new BadRequest(`Timetable for batch ${batch} on ${day} already exists`);
    }

    // Validate that all faculty IDs in periods exist
    const facultyIds = periods.map((p: any) => p.faculty);
    const facultyCount = await Faculty.countDocuments({ _id: { $in: facultyIds } });
    if (facultyCount !== facultyIds.length) {
      throw new BadRequest("One or more faculty IDs are invalid");
    }

    const timetable = await Timetable.create({
      batch,
      day,
      periods,
      createdBy: req.user._id as any, // cast to any
    });

    res.status(201).json(timetable);
  })
);

// ----------------------------------------------------------------------
// GET all timetables (filter by batch, day, etc.)
// ----------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { batch, day } = req.query;
    const filter: any = {};
    if (batch) filter.batch = batch;
    if (day) filter.day = day;

    const timetables = await Timetable.find(filter)
      .populate("periods.faculty", "name email")
      .populate("createdBy", "name email")
      .sort({ batch: 1, day: 1 });

    res.json(timetables);
  })
);

// ----------------------------------------------------------------------
// GET timetable by ID
// ----------------------------------------------------------------------
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const timetable = await Timetable.findById(id)
      .populate("periods.faculty", "name email")
      .populate("createdBy", "name email");

    if (!timetable) {
      throw new BadRequest("Timetable not found");
    }

    res.json(timetable);
  })
);

// ----------------------------------------------------------------------
// UPDATE timetable (Faculty only - creator or any faculty? Let's restrict to creator)
// ----------------------------------------------------------------------
router.patch(
  "/:id",
  validate(updateTimetableValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id: userId } = req.user;
    const { id } = req.params;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      throw new BadRequest("Timetable not found");
    }

    // Only the creator (faculty) can update
    if (role !== RoleEnum.FACULTY || timetable.createdBy.toString() !== userId.toString()) {
      throw new Unauthorized("You are not authorized to update this timetable");
    }

    const { batch, day, periods } = req.body;

    // If updating periods, validate faculty IDs
    if (periods) {
      const facultyIds = periods.map((p: any) => p.faculty);
      const facultyCount = await Faculty.countDocuments({ _id: { $in: facultyIds } });
      if (facultyCount !== facultyIds.length) {
        throw new BadRequest("One or more faculty IDs are invalid");
      }
    }

    // Update fields
    if (batch) timetable.batch = batch;
    if (day) timetable.day = day;
    if (periods) timetable.periods = periods;

    await timetable.save();

    res.json(timetable);
  })
);

// ----------------------------------------------------------------------
// DELETE timetable (Faculty creator only)
// ----------------------------------------------------------------------
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id: userId } = req.user;
    const { id } = req.params;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      throw new BadRequest("Timetable not found");
    }

    if (role !== RoleEnum.FACULTY || timetable.createdBy.toString() !== userId.toString()) {
      throw new Unauthorized("You are not authorized to delete this timetable");
    }

    await timetable.deleteOne();

    res.json({ msg: "Timetable deleted successfully" });
  })
);

export default router;