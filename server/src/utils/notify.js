import Notification from "../models/Notification.js";

export const createNotification = async ({ message, toEmail, actionRoute = "/dashboard" }) => {
  try {
    if (!toEmail) return null;
    return await Notification.create({ message, toEmail, actionRoute });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};
