import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter_name: { type: String, required: true },
    reporter_email: { type: String, required: true, lowercase: true },
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaign_title: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
