import mongoose from "mongoose";
import Contribution from "../models/Contribution.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notify.js";

export const createContribution = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { contribution_amount, message } = req.body;
  const amount = Number(contribution_amount);

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new ApiError(404, "Campaign not found.");
  if (campaign.status !== "approved") {
    throw new ApiError(400, "This campaign is not open for contributions.");
  }
  if (new Date(campaign.deadline) < new Date()) {
    throw new ApiError(400, "This campaign deadline has passed.");
  }
  if (amount < campaign.minimum_contribution) {
    throw new ApiError(400, `Minimum contribution is ${campaign.minimum_contribution} credits.`);
  }

  const supporter = await User.findById(req.user._id);
  if (supporter.credits < amount) {
    throw new ApiError(400, "Insufficient credits. Please purchase more credits.");
  }

  supporter.credits -= amount;
  await supporter.save();

  const contribution = await Contribution.create({
    campaign_id: campaign._id,
    campaign_title: campaign.campaign_title,
    contribution_amount: amount,
    supporter_email: supporter.user_email,
    supporter_name: supporter.display_name,
    creator_name: campaign.creator_name,
    creator_email: campaign.creator_email,
    message: message || "",
    status: "pending",
  });

  await createNotification({
    message: `${supporter.display_name} contributed ${amount} credits to "${campaign.campaign_title}".`,
    toEmail: campaign.creator_email,
    actionRoute: "/dashboard/creator",
  });

  res.status(201).json({ contribution, credits: supporter.credits });
});

export const getCreatorContributions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { creator_email: req.user.user_email };
  if (status) query.status = status;

  const contributions = await Contribution.find(query).sort({ current_date: -1 });
  res.json({ contributions });
});

export const getContributionsForCampaign = asyncHandler(async (req, res) => {
  const contributions = await Contribution.find({
    campaign_id: req.params.id,
    status: "approved",
  }).sort({ current_date: -1 });
  res.json({ contributions });
});

export const reviewContribution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Action must be approve or reject.");
  }

  const contribution = await Contribution.findById(id);
  if (!contribution) throw new ApiError(404, "Contribution not found.");
  if (contribution.creator_email !== req.user.user_email) {
    throw new ApiError(403, "You can only review contributions to your own campaigns.");
  }
  if (contribution.status !== "pending") {
    throw new ApiError(400, "This contribution has already been reviewed.");
  }

  if (action === "approve") {
    contribution.status = "approved";
    await contribution.save();
    await Campaign.updateOne(
      { _id: contribution.campaign_id },
      { $inc: { amount_raised: contribution.contribution_amount } }
    );

    await createNotification({
      message: `Your contribution of ${contribution.contribution_amount} credits to "${contribution.campaign_title}" was approved by ${req.user.display_name}.`,
      toEmail: contribution.supporter_email,
      actionRoute: "/dashboard/supporter/my-contributions",
    });
  } else {
    contribution.status = "rejected";
    await contribution.save();
    await User.updateOne(
      { user_email: contribution.supporter_email },
      { $inc: { credits: contribution.contribution_amount } }
    );

    await createNotification({
      message: `Your contribution of ${contribution.contribution_amount} credits to "${contribution.campaign_title}" was rejected by ${req.user.display_name}. Credits refunded.`,
      toEmail: contribution.supporter_email,
      actionRoute: "/dashboard/supporter/my-contributions",
    });
  }

  res.json({ contribution });
});

export const getMyContributions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));
  const { status } = req.query;

  const query = { supporter_email: req.user.user_email };
  if (status) query.status = status;

  const [contributions, total] = await Promise.all([
    Contribution.find(query)
      .sort({ current_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Contribution.countDocuments(query),
  ]);

  res.json({
    contributions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getSupporterStats = asyncHandler(async (req, res) => {
  const [total, pending, approvedAgg] = await Promise.all([
    Contribution.countDocuments({ supporter_email: req.user.user_email }),
    Contribution.countDocuments({ supporter_email: req.user.user_email, status: "pending" }),
    Contribution.aggregate([
      { $match: { supporter_email: req.user.user_email, status: "approved" } },
      { $group: { _id: null, sum: { $sum: "$contribution_amount" } } },
    ]),
  ]);

  res.json({
    totalContributions: total,
    pendingContributions: pending,
    totalContributed: approvedAgg[0]?.sum || 0,
  });
});

export const getApprovedContributions = asyncHandler(async (req, res) => {
  const contributions = await Contribution.find({
    supporter_email: req.user.user_email,
    status: "approved",
  }).sort({ current_date: -1 });
  res.json({ contributions });
});

export const getCreatorStats = asyncHandler(async (req, res) => {
  const email = req.user.user_email;
  const [total, active, raisedAgg] = await Promise.all([
    Campaign.countDocuments({ creator_email: email }),
    Campaign.countDocuments({ creator_email: email, deadline: { $gt: new Date() } }),
    Campaign.aggregate([
      { $match: { creator_email: email } },
      { $group: { _id: null, sum: { $sum: "$amount_raised" } } },
    ]),
  ]);

  const totalRaised = raisedAgg[0]?.sum || 0;
  res.json({
    totalCampaigns: total,
    activeCampaigns: active,
    totalRaised,
    withdrawableAmount: totalRaised / 20,
  });
});
