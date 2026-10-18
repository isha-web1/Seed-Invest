import { Router } from "express";
import { body } from "express-validator";
import {
  createWithdrawal,
  getMyWithdrawals,
  getPendingWithdrawals,
  approveWithdrawal,
  getWithdrawOverview,
  getAllWithdrawals,
} from "../controllers/withdrawalController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Creator
router.get("/overview", verifyToken, requireRole("creator"), getWithdrawOverview);
router.get("/mine", verifyToken, requireRole("creator"), getMyWithdrawals);
router.post(
  "/",
  verifyToken,
  requireRole("creator"),
  [
    body("withdrawal_credit").isInt({ min: 200 }).withMessage("Minimum withdrawal is 200 credits."),
    body("payment_system").notEmpty().withMessage("Select a payment system."),
    body("account_number").trim().notEmpty().withMessage("Account number is required."),
  ],
  validate,
  createWithdrawal
);

// Admin
router.get("/pending", verifyToken, requireRole("admin"), getPendingWithdrawals);
router.get("/all", verifyToken, requireRole("admin"), getAllWithdrawals);
router.patch("/:id/approve", verifyToken, requireRole("admin"), approveWithdrawal);

export default router;
