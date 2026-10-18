import User from "../models/User.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notify.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((u) => u.toSafeJSON()) });
});

export const removeUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === String(req.user._id)) {
    throw new ApiError(400, "You cannot remove your own admin account.");
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ message: "User removed." });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["admin", "creator", "supporter"].includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found.");

  user.role = role;
  await user.save();

  await createNotification({
    message: `Your account role has been updated to ${role} by the admin.`,
    toEmail: user.user_email,
    actionRoute: "/dashboard",
  });

  res.json({ user: user.toSafeJSON() });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [supporters, creators, creditsAgg] = await Promise.all([
    User.countDocuments({ role: "supporter" }),
    User.countDocuments({ role: "creator" }),
    User.aggregate([{ $group: { _id: null, sum: { $sum: "$credits" } } }]),
  ]);

  res.json({
    totalSupporters: supporters,
    totalCreators: creators,
    totalAvailableCredits: creditsAgg[0]?.sum || 0,
  });
});
