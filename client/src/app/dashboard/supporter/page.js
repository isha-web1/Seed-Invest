"use client";

import { useEffect, useState } from "react";
import { HandCoins, Clock, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import { formatNumber, statusColor } from "@/lib/utils";

export default function SupporterHome() {
  const [stats, setStats] = useState(null);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          api.get("/contributions/mine/stats"),
          api.get("/contributions/mine/approved"),
        ]);
        setStats(s.data);
        setApproved(a.data.contributions);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Supporter Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Contributions" value={formatNumber(stats?.totalContributions)} icon={HandCoins} accent="teal" />
        <StatCard label="Pending Contributions" value={formatNumber(stats?.pendingContributions)} icon={Clock} accent="amber" />
        <StatCard label="Total Amount Contributed" value={`${formatNumber(stats?.totalContributed)}`} suffix=" credits" icon={TrendingUp} accent="indigo" />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold">Approved Contributions</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-slate-500">No approved contributions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Creator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-slate-800">{c.campaign_title}</td>
                    <td>{formatNumber(c.contribution_amount)} credits</td>
                    <td>{c.creator_name}</td>
                    <td>
                      <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
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
