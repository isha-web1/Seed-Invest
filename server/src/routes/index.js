import { Router } from "express";
import authRoutes from "./auth.js";
import campaignRoutes from "./campaigns.js";
import contributionRoutes from "./contributions.js";
import withdrawalRoutes from "./withdrawals.js";
import paymentRoutes from "./payments.js";
import userRoutes from "./users.js";
import notificationRoutes from "./notifications.js";
import reportRoutes from "./reports.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/contributions", contributionRoutes);
router.use("/withdrawals", withdrawalRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);

export default router;
