import { Router } from "express";
import {
  createReport,
  getReports,
  resolveReport,
} from "../controllers/reportController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", verifyToken, requireRole("supporter"), createReport);
router.get("/", verifyToken, requireRole("admin"), getReports);
router.patch("/:id/resolve", verifyToken, requireRole("admin"), resolveReport);

export default router;
