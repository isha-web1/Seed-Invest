import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const STARTING_CREDITS = { supporter: 50, creator: 20 };

export const register = asyncHandler(async (req, res) => {
  const { display_name, user_email, photo_url, password, role } = req.body;

  if (!["supporter", "creator"].includes(role)) {
    throw new ApiError(400, "Role must be either supporter or creator.");
  }

  const email = user_email.toLowerCase().trim();
  const existing = await User.findOne({ user_email: email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    display_name,
    user_email: email,
    photo_url: photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(display_name)}`,
    password,
    role,
    credits: STARTING_CREDITS[role],
  });

  const token = signToken(user);
  res.status(201).json({ token, user: user.toSafeJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { user_email, password } = req.body;
  const email = user_email.toLowerCase().trim();

  const user = await User.findOne({ user_email: email }).select("+password");
  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = signToken(user);
  res.json({ token, user: user.toSafeJSON() });
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;
  if (!credential) throw new ApiError(400, "Google credential is required.");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, "Invalid Google credential.");
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ user_email: email });

  if (!user) {
    const assignedRole = ["supporter", "creator"].includes(role) ? role : "supporter";
    user = await User.create({
      display_name: payload.name || email.split("@")[0],
      user_email: email,
      photo_url: payload.picture || "",
      google_id: payload.sub,
      role: assignedRole,
      credits: STARTING_CREDITS[assignedRole],
    });
  }

  const token = signToken(user);
  res.json({ token, user: user.toSafeJSON() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});
