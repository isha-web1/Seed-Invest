import { Router } from "express";
import { body } from "express-validator";
import {
  createContribution,
  getCreatorContributions,
  getContributionsForCampaign,
  reviewContribution,
  getMyContributions,
  getSupporterStats,
  getApprovedContributions,
  getCreatorStats,
} from "../controllers/contributionController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Supporter
router.post(
  "/campaign/:campaignId",
  verifyToken,
  requireRole("supporter"),
  [body("contribution_amount").isInt({ min: 1 }).withMessage("Enter a valid amount.")],
  validate,
  createContribution
);
router.get("/mine", verifyToken, requireRole("supporter"), getMyContributions);
router.get("/mine/stats", verifyToken, requireRole("supporter"), getSupporterStats);
router.get("/mine/approved", verifyToken, requireRole("supporter"), getApprovedContributions);

// Creator
router.get("/creator", verifyToken, requireRole("creator"), getCreatorContributions);
router.get("/creator/stats", verifyToken, requireRole("creator"), getCreatorStats);

// Shared
router.get("/campaign/:id/approved", getContributionsForCampaign);
router.patch("/:id/review", verifyToken, requireRole("creator"), reviewContribution);

export default router;
