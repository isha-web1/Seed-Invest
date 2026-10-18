import Stripe from "stripe";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

export const CREDIT_PACKAGES = [
  { id: "pack-100", credits: 100, price: 10 },
  { id: "pack-300", credits: 300, price: 25 },
  { id: "pack-800", credits: 800, price: 60 },
  { id: "pack-1500", credits: 1500, price: 110 },
];

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const getPackages = asyncHandler(async (req, res) => {
  res.json({ packages: CREDIT_PACKAGES, stripeEnabled: Boolean(stripe) });
});

const creditUser = async (user, pkg, transactionId, note) => {
  const existing = transactionId
    ? await Payment.findOne({ transaction_id: transactionId })
    : null;
  if (existing) {
    return existing;
  }

  user.credits += pkg.credits;
  await user.save();

  return Payment.create({
    user_email: user.user_email,
    user_name: user.display_name,
    credits: pkg.credits,
    amount: pkg.price,
    payment_system: "stripe",
    transaction_id: transactionId,
    status: "paid",
    payment_date: new Date(),
    note,
  });
};

export const createCheckout = asyncHandler(async (req, res) => {
  const { packageId } = req.body;
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new ApiError(400, "Invalid credit package.");

  if (!stripe) {
    const payment = await creditUser(
      req.user,
      pkg,
      `dummy_${Date.now()}_${req.user._id}`,
      "Dummy payment (Stripe not configured)"
    );
    return res.json({ dummy: true, payment, credits: req.user.credits });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${pkg.credits} SeedInvest Credits` },
          unit_amount: pkg.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      packageId: pkg.id,
      credits: String(pkg.credits),
      userEmail: req.user.user_email,
    },
    success_url: `${clientUrl}/dashboard/supporter/purchase-credit?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/dashboard/supporter/purchase-credit?canceled=true`,
  });

  res.json({ url: session.url, sessionId: session.id });
});

export const confirmCheckout = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!stripe) throw new ApiError(400, "Stripe is not configured.");
  if (!sessionId) throw new ApiError(400, "sessionId is required.");

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    throw new ApiError(400, "Payment not completed yet.");
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === session.metadata.packageId);
  if (!pkg) throw new ApiError(400, "Unknown package in session.");

  const user = await User.findById(req.user._id);
  const payment = await creditUser(user, pkg, session.id, "Stripe checkout");
  res.json({ payment, credits: user.credits });
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user_email: req.user.user_email }).sort({
    payment_date: -1,
  });
  res.json({ payments });
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ payment_date: -1 });
  res.json({ payments });
});
