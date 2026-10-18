import Report from "../models/Report.js";
import Campaign from "../models/Campaign.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notify.js";

export const createReport = asyncHandler(async (req, res) => {
  const { campaign_id, reason } = req.body;
  const campaign = await Campaign.findById(campaign_id);
  if (!campaign) throw new ApiError(404, "Campaign not found.");

  const report = await Report.create({
    reporter_name: req.user.display_name,
    reporter_email: req.user.user_email,
    campaign_id: campaign._id,
    campaign_title: campaign.campaign_title,
    reason,
  });

  await createNotification({
    message: `A new report was submitted for "${campaign.campaign_title}".`,
    toEmail: process.env.ADMIN_EMAIL || campaign.creator_email,
    actionRoute: "/dashboard/admin/reports",
  });

  res.status(201).json({ report });
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find().sort({ date: -1 });
  res.json({ reports });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found.");
  report.status = "resolved";
  await report.save();
  res.json({ report });
});
