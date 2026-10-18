import mongoose from "mongoose";

export const WITHDRAWAL_STATUS = ["pending", "approved", "rejected"];
export const PAYMENT_SYSTEMS = ["stripe", "bkash", "rocket", "nagad", "other"];

const withdrawalSchema = new mongoose.Schema(
  {
    creator_email: { type: String, required: true, lowercase: true },
    creator_name: { type: String, required: true },
    withdrawal_credit: { type: Number, required: true, min: 200 },
    withdrawal_amount: { type: Number, required: true, min: 0 },
    payment_system: { type: String, enum: PAYMENT_SYSTEMS, required: true },
    account_number: { type: String, required: true },
    status: { type: String, enum: WITHDRAWAL_STATUS, default: "pending" },
    withdraw_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
