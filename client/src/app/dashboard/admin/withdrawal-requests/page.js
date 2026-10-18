"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export default function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/withdrawals/pending");
      setWithdrawals(data.withdrawals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    try {
      await api.patch(`/withdrawals/${id}/approve`);
      toast.success("Payment marked successful.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading withdrawal requests..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
      <div className="card p-5">
        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500">No pending withdrawal requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>System</th>
                  <th>Account</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td className="font-medium text-slate-800">
                      {w.creator_name}
                      <span className="block text-xs text-slate-400">{w.creator_email}</span>
                    </td>
                    <td>{formatNumber(w.withdrawal_credit)}</td>
                    <td>{formatCurrency(w.withdrawal_amount)}</td>
                    <td className="capitalize">{w.payment_system}</td>
                    <td>{w.account_number}</td>
                    <td>{formatDate(w.withdraw_date)}</td>
                    <td>
                      <button className="btn-primary px-3 py-1 text-xs" onClick={() => approve(w._id)}>
                        Payment Success
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
