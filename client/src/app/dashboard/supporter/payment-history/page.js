"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatCurrency, formatDate, formatNumber, statusColor } from "@/lib/utils";

export default function SupporterPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/payments/mine")
      .then(({ data }) => setPayments(data.payments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment History</h1>
      <div className="card p-5">
        {loading ? (
          <Loader label="Loading payments..." />
        ) : payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>System</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="max-w-[200px] truncate text-xs text-slate-500">{p.transaction_id || p._id}</td>
                    <td>{formatNumber(p.credits)}</td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td className="capitalize">{p.payment_system}</td>
                    <td>{formatDate(p.payment_date)}</td>
                    <td>
                      <span className={`badge ${statusColor(p.status)}`}>{p.status}</span>
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
