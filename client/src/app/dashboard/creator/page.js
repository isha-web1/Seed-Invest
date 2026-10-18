"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FolderKanban, Activity, TrendingUp, Eye } from "lucide-react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { formatCurrency, formatDate, formatNumber, statusColor } from "@/lib/utils";

export default function CreatorHome() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api.get("/contributions/creator/stats"),
        api.get("/contributions/creator", { params: { status: "pending" } }),
      ]);
      setStats(s.data);
      setPending(c.data.contributions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, action) => {
    try {
      await api.patch(`/contributions/${id}/review`, { action });
      toast.success(`Contribution ${action}d.`);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Campaigns" value={formatNumber(stats?.totalCampaigns)} icon={FolderKanban} accent="teal" />
        <StatCard label="Active Campaigns" value={formatNumber(stats?.activeCampaigns)} icon={Activity} accent="indigo" />
        <StatCard
          label="Total Raised"
          value={`${formatNumber(stats?.totalRaised)}`}
          suffix=" credits"
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contributions To Review</h2>
          <span className="text-xs text-slate-500">
            Withdrawable: {formatCurrency((stats?.totalRaised || 0) / 20)}
          </span>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending contributions to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Supporter</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>View</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-slate-800">{c.supporter_name}</td>
                    <td>{c.campaign_title}</td>
                    <td>{formatNumber(c.contribution_amount)} credits</td>
                    <td>
                      <button
                        onClick={() => setSelected(c)}
                        className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-primary px-3 py-1 text-xs" onClick={() => review(c._id, "approve")}>
                          Approve
                        </button>
                        <button className="btn-danger px-3 py-1 text-xs" onClick={() => review(c._id, "reject")}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Contribution detail"
        footer={
          <>
            <button className="btn-danger" onClick={() => review(selected._id, "reject")}>
              Reject
            </button>
            <button className="btn-primary" onClick={() => review(selected._id, "approve")}>
              Approve
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-2">
            <p><span className="font-semibold">Supporter:</span> {selected.supporter_name} ({selected.supporter_email})</p>
            <p><span className="font-semibold">Campaign:</span> {selected.campaign_title}</p>
            <p><span className="font-semibold">Amount:</span> {formatNumber(selected.contribution_amount)} credits</p>
            <p><span className="font-semibold">Date:</span> {formatDate(selected.current_date)}</p>
            <p><span className="font-semibold">Status:</span>{" "}
              <span className={`badge ${statusColor(selected.status)}`}>{selected.status}</span>
            </p>
            {selected.message && (
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                <span className="font-semibold">Message:</span> {selected.message}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
