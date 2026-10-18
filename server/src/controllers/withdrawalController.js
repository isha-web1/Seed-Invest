import Withdrawal from "../models/Withdrawal.js";
import Campaign from "../models/Campaign.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notify.js";

const CREDITS_PER_DOLLAR = 20;
const MIN_WITHDRAW_CREDITS = 200;

const getCreatorAvailableCredits = async (email) => {
  const raised = await Campaign.aggregate([
    { $match: { creator_email: email } },
    { $group: { _id: null, sum: { $sum: "$amount_raised" } } },
  ]);
  const totalRaised = raised[0]?.sum || 0;

  const reserved = await Withdrawal.aggregate([
    { $match: { creator_email: email, status: { $in: ["pending", "approved"] } } },
    { $group: { _id: null, sum: { $sum: "$withdrawal_credit" } } },
  ]);
  const totalWithdrawn = reserved[0]?.sum || 0;

  return Math.max(0, totalRaised - totalWithdrawn);
};

export const getWithdrawOverview = asyncHandler(async (req, res) => {
  const available = await getCreatorAvailableCredits(req.user.user_email);
  res.json({
    availableCredits: available,
    availableAmount: available / CREDITS_PER_DOLLAR,
    minWithdrawCredits: MIN_WITHDRAW_CREDITS,
    creditsPerDollar: CREDITS_PER_DOLLAR,
  });
});

export const createWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawal_credit, payment_system, account_number } = req.body;
  const credits = Number(withdrawal_credit);

  if (credits < MIN_WITHDRAW_CREDITS) {
    throw new ApiError(400, `Minimum withdrawal is ${MIN_WITHDRAW_CREDITS} credits.`);
  }

  const available = await getCreatorAvailableCredits(req.user.user_email);
  if (credits > available) {
    throw new ApiError(400, "Insufficient credit.");
  }

  const withdrawal = await Withdrawal.create({
    creator_email: req.user.user_email,
    creator_name: req.user.display_name,
    withdrawal_credit: credits,
    withdrawal_amount: credits / CREDITS_PER_DOLLAR,
    payment_system,
    account_number,
    status: "pending",
  });

  res.status(201).json({ withdrawal });
});

export const getMyWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({ creator_email: req.user.user_email }).sort({
    withdraw_date: -1,
  });
  res.json({ withdrawals });
});

export const getPendingWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({ status: "pending" }).sort({ withdraw_date: -1 });
  res.json({ withdrawals });
});

export const approveWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new ApiError(404, "Withdrawal request not found.");
  if (withdrawal.status !== "pending") {
    throw new ApiError(400, "This withdrawal has already been processed.");
  }

  withdrawal.status = "approved";
  await withdrawal.save();

  await createNotification({
    message: `Your withdrawal of ${withdrawal.withdrawal_credit} credits ($${withdrawal.withdrawal_amount}) has been approved.`,
    toEmail: withdrawal.creator_email,
    actionRoute: "/dashboard/creator/payment-history",
  });

  res.json({ withdrawal });
});

export const getAllWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find().sort({ withdraw_date: -1 });
  res.json({ withdrawals });
});
