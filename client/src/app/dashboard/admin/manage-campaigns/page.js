"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { formatDate, formatNumber, statusColor } from "@/lib/utils";

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/campaigns/all");
      setCampaigns(data.campaigns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    try {
      await api.delete(`/campaigns/${deleting._id}`);
      toast.success("Campaign deleted.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading campaigns..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Campaigns</h1>
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Title</th>
                <th>Creator</th>
                <th>Category</th>
                <th>Raised</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id}>
                  <td className="max-w-[220px] truncate font-medium text-slate-800">
                    {c.campaign_title}
                  </td>
                  <td>{c.creator_name}</td>
                  <td>{c.category}</td>
                  <td>{formatNumber(c.amount_raised)}</td>
                  <td>{formatDate(c.deadline)}</td>
                  <td>
                    <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setDeleting(c)}
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete Campaign"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={remove}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Delete <strong>{deleting?.campaign_title}</strong>? This removes it from the platform.
        </p>
      </Modal>
    </div>
  );
}
