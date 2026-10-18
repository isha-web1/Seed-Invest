import mongoose from "mongoose";

export const CAMPAIGN_CATEGORIES = [
  "Technology",
  "Art",
  "Community",
  "Health",
  "Education",
  "Environment",
];

export const CAMPAIGN_STATUS = ["pending", "approved", "rejected", "suspended"];

const campaignSchema = new mongoose.Schema(
  {
    campaign_title: { type: String, required: true, trim: true },
    campaign_story: { type: String, required: true },
    category: { type: String, enum: CAMPAIGN_CATEGORIES, required: true },
    funding_goal: { type: Number, required: true, min: 1 },
    minimum_contribution: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    reward_info: { type: String, default: "" },
    campaign_image_url: { type: String, default: "" },
    creator_email: { type: String, required: true, lowercase: true },
    creator_name: { type: String, required: true },
    amount_raised: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: CAMPAIGN_STATUS, default: "pending" },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, deadline: 1 });
campaignSchema.index({ amount_raised: -1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
