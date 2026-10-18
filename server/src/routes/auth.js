import { Router } from "express";
import { body } from "express-validator";
import { register, login, googleAuth, me } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  [
    body("display_name").trim().notEmpty().withMessage("Name is required."),
    body("user_email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters.")
      .matches(/[A-Za-z]/)
      .withMessage("Password must contain a letter.")
      .matches(/\d/)
      .withMessage("Password must contain a number."),
    body("role")
      .optional()
      .isIn(["supporter", "creator"])
      .withMessage("Role must be supporter or creator."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("user_email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.post("/google", googleAuth);
router.get("/me", verifyToken, me);

export default router;
