"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Banknote } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function WithdrawalsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    withdrawal_credit: "",
    payment_system: "stripe",
    account_number: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await api.get("/withdrawals/overview");
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const credits = Number(form.withdrawal_credit) || 0;
  const amount = credits / (overview?.creditsPerDollar || 20);
  const insufficient = credits > (overview?.availableCredits || 0);
  const belowMin = credits > 0 && credits < (overview?.minWithdrawCredits || 200);

  const submit = async (e) => {
    e.preventDefault();
    if (insufficient || belowMin) return;
    setSubmitting(true);
    try {
      await api.post("/withdrawals", {
        withdrawal_credit: credits,
        payment_system: form.payment_system,
        account_number: form.account_number,
      });
      toast.success("Withdrawal request submitted!");
      setForm({ withdrawal_credit: "", payment_system: "stripe", account_number: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading withdrawal info..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawals</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Current Raised Credits</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {formatNumber(overview.availableCredits)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Withdrawal Amount</p>
          <p className="mt-1 text-3xl font-extrabold text-teal-700">
            {formatCurrency(overview.availableAmount)}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <Banknote className="h-5 w-5 text-teal-600" /> Request a Withdrawal
        </h2>
        <p className="mb-5 text-xs text-slate-500">
          Minimum withdrawal: {overview.minWithdrawCredits} credits ($
          {overview.minWithdrawCredits / overview.creditsPerDollar}). Rate: {overview.creditsPerDollar}{" "}
          credits = $1.
        </p>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Credits To Withdraw</label>
            <input
              type="number"
              min={overview.minWithdrawCredits}
              className="input"
              value={form.withdrawal_credit}
              onChange={(e) => setForm({ ...form, withdrawal_credit: e.target.value })}
            />
            {belowMin && (
              <p className="mt-1 text-xs text-red-600">
                Minimum withdrawal is {overview.minWithdrawCredits} credits.
              </p>
            )}
          </div>

          <div>
            <label className="label">Withdraw Amount ($)</label>
            <input className="input bg-slate-50" value={amount.toFixed(2)} readOnly disabled />
          </div>

          <div>
            <label className="label">Select Payment System</label>
            <select
              className="input"
              value={form.payment_system}
              onChange={(e) => setForm({ ...form, payment_system: e.target.value })}
            >
              <option value="stripe">Stripe</option>
              <option value="bkash">Bkash</option>
              <option value="rocket">Rocket</option>
              <option value="nagad">Nagad</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Account Number</label>
            <input
              className="input"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            {insufficient ? (
              <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                Insufficient credit
              </p>
            ) : (
              <button type="submit" className="btn-primary" disabled={submitting || credits <= 0 || belowMin}>
                {submitting ? "Submitting..." : "Withdraw"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
