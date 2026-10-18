"use client";

import { useEffect, useState } from "react";
import { Users, UserCog, Coins, ReceiptText } from "lucide-react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminHome() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([api.get("/users/stats"), api.get("/payments/all")]);
        const payments = p.data.payments || [];
        setStats({
          ...s.data,
          paymentsCount: payments.length,
          paymentsSum: payments.reduce((acc, x) => acc + x.amount, 0),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Supporters" value={formatNumber(stats.totalSupporters)} icon={Users} accent="teal" />
        <StatCard label="Total Creators" value={formatNumber(stats.totalCreators)} icon={UserCog} accent="indigo" />
        <StatCard
          label="Total Available Credits"
          value={formatNumber(stats.totalAvailableCredits)}
          icon={Coins}
          accent="amber"
        />
        <StatCard
          label="Payments Processed"
          value={formatNumber(stats.paymentsCount)}
          suffix={` (${formatCurrency(stats.paymentsSum)})`}
          icon={ReceiptText}
          accent="rose"
        />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Platform overview</h2>
        <p className="mt-2 text-sm text-slate-500">
          As the platform admin you approve campaigns, manage user roles, process withdrawal
          requests and resolve reports. Use the navigation to jump into any queue.
        </p>
      </div>
    </div>
  );
}
