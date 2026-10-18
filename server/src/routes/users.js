import { Router } from "express";
import {
  getUsers,
  removeUser,
  updateUserRole,
  getAdminStats,
} from "../controllers/userController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/", getUsers);
router.get("/stats", getAdminStats);
router.delete("/:id", removeUser);
router.patch("/:id/role", updateUserRole);

export default router;
