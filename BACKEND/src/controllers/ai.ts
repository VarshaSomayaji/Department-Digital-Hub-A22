import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { allowRoles } from "../middlewares/RoleGuard";
import { doubtResolution, summarizeText, intelligentSearch, extractProjectMetadata } from "../services/gemini.service";
import { BadRequest } from "../customErrors";

const router = Router();

// Doubt resolution (students, faculty)
router.post(
  "/doubt",
  allowRoles("STUDENT", "FACULTY"),
  asyncHandler(async (req: Request, res: Response) => {
    const { question, context } = req.body;
    if (!question) throw new BadRequest("Question is required");
    try {
      const answer = await doubtResolution(question, context);
      res.json({ answer });
    } catch (error) {
      res.status(503).json({ 
        msg: "AI service is temporarily unavailable. Please try again later." 
      });
    }
  })
);

router.post(
  "/extract-project",
  allowRoles("FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;
    if (!title || !description) throw new BadRequest("Title and description required");
    const metadata = await extractProjectMetadata(title, description);
    res.json(metadata);
  })
);

// Summarize notes (faculty, HOD, Admin)
router.post(
  "/summarize",
  allowRoles("FACULTY", "HOD", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text) throw new BadRequest("Text is required");
    const summary = await summarizeText(text);
    res.json({ summary });
  })
);

// Intelligent search (all roles)
router.get(
  "/search",
  allowRoles("ADMIN", "HOD", "FACULTY", "STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q) throw new BadRequest("Query is required");
    // This could combine database search with AI refinement
    const result = await intelligentSearch(q as string);
    // For now, just return AI's response
    res.json({ result });
  })
);

export default router;