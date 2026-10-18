import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true, lowercase: true },
    user_name: { type: String, required: true },
    credits: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    payment_system: { type: String, default: "stripe" },
    transaction_id: { type: String, default: "" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
    payment_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
