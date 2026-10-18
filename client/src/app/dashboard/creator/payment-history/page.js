"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatCurrency, formatDate, formatNumber, statusColor } from "@/lib/utils";

export default function CreatorPaymentHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/withdrawals/mine")
      .then(({ data }) => setWithdrawals(data.withdrawals))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment History</h1>
      <div className="card p-5">
        {loading ? (
          <Loader label="Loading withdrawals..." />
        ) : withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500">No withdrawal payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>System</th>
                  <th>Account</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td>{formatNumber(w.withdrawal_credit)}</td>
                    <td>{formatCurrency(w.withdrawal_amount)}</td>
                    <td className="capitalize">{w.payment_system}</td>
                    <td>{w.account_number}</td>
                    <td>{formatDate(w.withdraw_date)}</td>
                    <td>
                      <span className={`badge ${statusColor(w.status)}`}>{w.status}</span>
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
