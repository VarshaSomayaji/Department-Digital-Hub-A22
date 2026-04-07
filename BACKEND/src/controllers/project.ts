import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Project } from "../models/project.model";
import { allowRoles } from "../middlewares/RoleGuard";
import { validate } from "../middlewares/Validator";
import {
  createProjectValidator,
  updateProjectValidator,
} from "../validators/project.validator";
import { uploadLocal, removeFile } from "../constants/lib";
import CONFIG from "../config";
import { BadRequest, Forbidden } from "../customErrors";
import { extractProjectMetadata } from "../services/gemini.service";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";

const router = Router();

const pump = promisify(pipeline);

router.post(
  "/",
  allowRoles("FACULTY", "STUDENT"),
  uploadLocal.single("zip"), // accept single file under field "zip"
  validate(createProjectValidator),
  asyncHandler(async (req: Request, res: Response) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { title, description, year, tags } = req.body;
    const zipFile = req.file;

    if (!zipFile) {
      throw new BadRequest("ZIP file is required");
    }

    // Generate a unique project ID for directory
    const projectId = randomUUID();
    const projectDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
    fs.mkdirSync(projectDir, { recursive: true });

    // Extract ZIP
    const zip = new AdmZip(zipFile.path);
    zip.extractAllTo(projectDir, true); // overwrite

    // Recursively collect all extracted files and generate URLs
    const walk = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(fullPath));
        } else {
          const relPath = path.relative(projectDir, fullPath).replace(/\\/g, "/");
          results.push(`${CONFIG.HOST}/static/uploads/projects/${projectId}/${relPath}`);
        }
      });
      return results;
    };
    const fileUrls = walk(projectDir);

    // Remove the temporary uploaded zip file
    fs.unlinkSync(zipFile.path);

    // Call Gemini for metadata
    let metadata: any = {};
    try {
      metadata = await extractProjectMetadata(title, description);
    } catch (error) {
      console.error("Gemini extraction failed");
    }

    const project = await Project.create({
      title,
      description,
      domain: metadata.domain || "Unknown",
      techStack: metadata.techStack || [],
      keywords: metadata.keywords || [],
      summary: metadata.summary || "",
      fileUrls,
      uploadedBy: { role: req.user.role, id: req.user._id },
      year: Number(year),
      tags: tags
        ? typeof tags === "string"
          ? tags.split(",").map((t: string) => t.trim())
          : tags
        : [],
    });

    res.status(201).json(project);
  })
);

// GET /projects – list with filters
router.get(
  "/",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { domain, year, search } = req.query;
    let query: any = {};
    if (domain) query.domain = domain;
    if (year) query.year = Number(year);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keywords: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    const projects = await Project.find(query)
      .populate("uploadedBy.id", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  }),
);

// GET /projects/:id
router.get(
  "/:id",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id).populate(
      "uploadedBy.id",
      "name email",
    );
    if (!project) throw new BadRequest("Project not found");
    res.json(project);
  }),
);

// PATCH /projects/:id – update project (owner or admin)
router.patch(
  "/:id",
  allowRoles("FACULTY", "STUDENT", "ADMIN"),
  validate(updateProjectValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id);
    if (!project) throw new BadRequest("Project not found");

    // Check permission
    if (
      req.user.role !== "ADMIN" &&
      project.uploadedBy.id.toString() !== req.user._id.toString()
    ) {
      throw new Forbidden("You can only update your own projects");
    }

    const {
      title,
      description,
      domain,
      techStack,
      keywords,
      summary,
      year,
      tags,
    } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (domain) project.domain = domain;
    if (techStack)
      project.techStack = Array.isArray(techStack)
        ? techStack
        : techStack.split(",").map((t: string) => t.trim());
    if (keywords)
      project.keywords = Array.isArray(keywords)
        ? keywords
        : keywords.split(",").map((k: string) => k.trim());
    if (summary) project.summary = summary;
    if (year) project.year = Number(year);
    if (tags)
      project.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t: string) => t.trim());

    await project.save();
    res.json(project);
  }),
);

// DELETE /projects/:id
router.delete(
  "/:id",
  allowRoles("FACULTY", "STUDENT", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id);
    if (!project) throw new BadRequest("Project not found");
    if (
      req.user.role !== "ADMIN" &&
      project.uploadedBy.id.toString() !== req.user._id.toString()
    ) {
      throw new Forbidden("You can only delete your own projects");
    }
    // Optionally delete files from storage
    await project.deleteOne();
    res.json({ msg: "Project deleted successfully" });
  }),
);

// GET /projects/similar – find similar projects by idea text
router.get(
  "/similar",
  allowRoles("FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { idea } = req.query;
    if (!idea) throw new BadRequest("Idea text is required");
    const similar = await Project.find({
      $or: [
        { title: { $regex: idea, $options: "i" } },
        { description: { $regex: idea, $options: "i" } },
        { keywords: { $in: [new RegExp(idea as string, "i")] } },
      ],
    }).limit(5);
    res.json(similar);
  }),
);

// GET /projects/analytics/domains – domain trends (Admin/HOD)
router.get(
  "/analytics/domains",
  allowRoles("ADMIN", "HOD"),
  asyncHandler(async (req: Request, res: Response) => {
    const analytics = await Project.aggregate([
      {
        $group: {
          _id: { domain: "$domain", year: "$year" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, count: -1 } },
    ]);
    res.json(analytics);
  }),
);

// GET /projects/stats/domains – project counts per domain
router.get(
  "/stats/domains",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await Project.aggregate([
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const formatted = stats.map((item: any) => ({
      name: item._id || "Unknown",
      value: item.count,
    }));
    res.json(formatted);
  })
);

// GET /projects/stats/years – project counts per year
router.get(
  "/stats/years",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await Project.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const formatted = stats.map((item: any) => ({
      year: item._id,
      count: item.count,
    }));
    res.json(formatted);
  })
);

// GET /projects/my/recent?limit=5 – get recent projects by current user (faculty/student)
router.get(
  "/my/recent",
  allowRoles("FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const projects = await Project.find({ "uploadedBy.id": req.user._id })
      .populate("uploadedBy.id", "name")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(projects);
  })
);

export default router;
