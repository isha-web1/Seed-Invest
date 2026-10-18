import mongoose from "mongoose";

export const CONTRIBUTION_STATUS = ["pending", "approved", "rejected"];

const contributionSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaign_title: { type: String, required: true },
    contribution_amount: { type: Number, required: true, min: 1 },
    supporter_email: { type: String, required: true, lowercase: true },
    supporter_name: { type: String, required: true },
    creator_name: { type: String, required: true },
    creator_email: { type: String, required: true, lowercase: true },
    message: { type: String, default: "" },
    current_date: { type: Date, default: Date.now },
    status: { type: String, enum: CONTRIBUTION_STATUS, default: "pending" },
  },
  { timestamps: true }
);

contributionSchema.index({ supporter_email: 1, status: 1 });
contributionSchema.index({ creator_email: 1, status: 1 });
contributionSchema.index({ campaign_id: 1, status: 1 });

const Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;
