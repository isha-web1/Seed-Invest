"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatDate, formatNumber } from "@/lib/utils";

export default function CampaignApprovals() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/campaigns/pending");
      setCampaigns(data.campaigns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, action) => {
    try {
      await api.patch(`/campaigns/${id}/review`, { action });
      toast.success(`Campaign ${action}d.`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading pending campaigns..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campaign Approvals</h1>
      <div className="card p-5">
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-500">No campaigns awaiting approval.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Category</th>
                  <th>Goal</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-[240px] truncate font-medium text-slate-800">
                      {c.campaign_title}
                    </td>
                    <td>{c.creator_name}</td>
                    <td>{c.category}</td>
                    <td>{formatNumber(c.funding_goal)}</td>
                    <td>{formatDate(c.deadline)}</td>
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
    </div>
  );
}
