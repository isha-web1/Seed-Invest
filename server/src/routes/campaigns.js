import { Router } from "express";
import { body } from "express-validator";
import {
  createCampaign,
  getMyCampaigns,
  updateCampaign,
  deleteCampaign,
  exploreCampaigns,
  getTopFunded,
  getCampaignById,
  getPendingCampaigns,
  reviewCampaign,
  getAllCampaigns,
  suspendCampaign,
} from "../controllers/campaignController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Public
router.get("/top-funded", getTopFunded);
router.get("/explore", exploreCampaigns);

// Admin
router.get("/pending", verifyToken, requireRole("admin"), getPendingCampaigns);
router.get("/all", verifyToken, requireRole("admin"), getAllCampaigns);
router.patch("/:id/review", verifyToken, requireRole("admin"), reviewCampaign);
router.patch("/:id/suspend", verifyToken, requireRole("admin"), suspendCampaign);

// Creator
router.get("/mine", verifyToken, requireRole("creator"), getMyCampaigns);
router.post(
  "/",
  verifyToken,
  requireRole("creator"),
  [
    body("campaign_title").trim().notEmpty().withMessage("Campaign title is required."),
    body("campaign_story").trim().notEmpty().withMessage("Campaign story is required."),
    body("category").notEmpty().withMessage("Category is required."),
    body("funding_goal").isInt({ min: 1 }).withMessage("Funding goal must be a positive number."),
    body("minimum_contribution")
      .isInt({ min: 1 })
      .withMessage("Minimum contribution must be a positive number."),
    body("deadline").isISO8601().withMessage("A valid deadline is required."),
  ],
  validate,
  createCampaign
);

// Campaign details (must be after specific paths)
router.get("/:id", getCampaignById);
router.patch("/:id", verifyToken, requireRole("creator", "admin"), updateCampaign);
router.delete("/:id", verifyToken, requireRole("creator", "admin"), deleteCampaign);

export default router;
