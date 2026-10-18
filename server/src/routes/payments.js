import { Router } from "express";
import {
  getPackages,
  createCheckout,
  confirmCheckout,
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/packages", getPackages);
router.post("/checkout", verifyToken, createCheckout);
router.post("/confirm", verifyToken, confirmCheckout);
router.get("/mine", verifyToken, getMyPayments);
router.get("/all", verifyToken, requireRole("admin"), getAllPayments);

export default router;
