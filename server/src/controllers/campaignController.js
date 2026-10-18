import Campaign from "../models/Campaign.js";
import Contribution from "../models/Contribution.js";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notify.js";

export const createCampaign = asyncHandler(async (req, res) => {
  const {
    campaign_title,
    campaign_story,
    category,
    funding_goal,
    minimum_contribution,
    deadline,
    reward_info,
    campaign_image_url,
  } = req.body;

  const campaign = await Campaign.create({
    campaign_title,
    campaign_story,
    category,
    funding_goal,
    minimum_contribution,
    deadline,
    reward_info,
    campaign_image_url,
    creator_email: req.user.user_email,
    creator_name: req.user.display_name,
    status: "pending",
  });

  res.status(201).json({ campaign });
});

export const getMyCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ creator_email: req.user.user_email }).sort({
    deadline: -1,
  });
  res.json({ campaigns });
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  if (campaign.creator_email !== req.user.user_email && req.user.role !== "admin") {
    throw new ApiError(403, "You can only update your own campaigns.");
  }

  const { campaign_title, campaign_story, reward_info } = req.body;
  if (campaign_title !== undefined) campaign.campaign_title = campaign_title;
  if (campaign_story !== undefined) campaign.campaign_story = campaign_story;
  if (reward_info !== undefined) campaign.reward_info = reward_info;

  await campaign.save();
  res.json({ campaign });
});

const refundApprovedSupporters = async (campaignId) => {
  const approved = await Contribution.find({ campaign_id: campaignId, status: "approved" });
  for (const contribution of approved) {
    await User.updateOne(
      { user_email: contribution.supporter_email },
      { $inc: { credits: contribution.contribution_amount } }
    );
    contribution.status = "rejected";
    await contribution.save();
  }
  return approved.length;
};

export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  if (campaign.creator_email !== req.user.user_email && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own campaigns.");
  }

  const refunded = await refundApprovedSupporters(campaign._id);
  await Campaign.findByIdAndDelete(id);
  res.json({ message: "Campaign deleted.", refundedSupporters: refunded });
});

export const exploreCampaigns = asyncHandler(async (req, res) => {
  const { category, search, minGoal, maxGoal, sort } = req.query;

  const query = { status: "approved", deadline: { $gt: new Date() } };
  if (category) query.category = category;
  if (search) query.campaign_title = { $regex: search, $options: "i" };
  if (minGoal || maxGoal) {
    query.funding_goal = {};
    if (minGoal) query.funding_goal.$gte = Number(minGoal);
    if (maxGoal) query.funding_goal.$lte = Number(maxGoal);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "deadline") sortOption = { deadline: 1 };
  if (sort === "progress") sortOption = { amount_raised: -1 };

  const campaigns = await Campaign.find(query).sort(sortOption);
  res.json({ campaigns });
});

export const getTopFunded = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ status: "approved" })
    .sort({ amount_raised: -1 })
    .limit(6);
  res.json({ campaigns });
});

export const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  res.json({ campaign });
});

export const getPendingCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json({ campaigns });
});

export const reviewCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Action must be approve or reject.");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");

  campaign.status = action === "approve" ? "approved" : "rejected";
  await campaign.save();

  await createNotification({
    message: `Your campaign "${campaign.campaign_title}" was ${campaign.status} by the admin.`,
    toEmail: campaign.creator_email,
    actionRoute: "/dashboard/creator/my-campaigns",
  });

  res.json({ campaign });
});

export const getAllCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  res.json({ campaigns });
});

export const suspendCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  campaign.status = "suspended";
  await campaign.save();
  await createNotification({
    message: `Your campaign "${campaign.campaign_title}" has been suspended by the admin.`,
    toEmail: campaign.creator_email,
    actionRoute: "/dashboard/creator/my-campaigns",
  });
  res.json({ campaign });
});
