import { Router } from "express";
import {
  getMyNotifications,
  markAllRead,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, getMyNotifications);
router.patch("/read-all", verifyToken, markAllRead);

export default router;
