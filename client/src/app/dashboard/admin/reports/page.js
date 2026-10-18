"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { formatDate, statusColor } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/reports");
      setReports(data.reports);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const suspend = async (campaignId, reportId) => {
    try {
      await api.patch(`/campaigns/${campaignId}/suspend`);
      await api.patch(`/reports/${reportId}/resolve`);
      toast.success("Campaign suspended.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeCampaign = async (campaignId, reportId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      await api.patch(`/reports/${reportId}/resolve`);
      toast.success("Campaign deleted.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading reports..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="card p-5">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">No reports submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Campaign</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td className="font-medium text-slate-800">{r.reporter_name}</td>
                    <td>{r.campaign_title}</td>
                    <td className="max-w-[240px] text-slate-600">{r.reason}</td>
                    <td>{formatDate(r.date)}</td>
                    <td>
                      <span className={`badge ${statusColor(r.status === "resolved" ? "approved" : "pending")}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn-outline px-3 py-1 text-xs"
                          onClick={() => suspend(r.campaign_id, r._id)}
                        >
                          Suspend
                        </button>
                        <button
                          className="btn-danger px-3 py-1 text-xs"
                          onClick={() => removeCampaign(r.campaign_id, r._id)}
                        >
                          Delete
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
