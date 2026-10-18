import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ toEmail: req.user.user_email }).sort({
    time: -1,
  });
  res.json({ notifications });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { toEmail: req.user.user_email, read: false },
    { $set: { read: true } }
  );
  res.json({ message: "All notifications marked as read." });
});
