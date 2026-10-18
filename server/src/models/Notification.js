import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  toEmail: { type: String, required: true, lowercase: true },
  actionRoute: { type: String, default: "/dashboard" },
  read: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
});

notificationSchema.index({ toEmail: 1, time: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
