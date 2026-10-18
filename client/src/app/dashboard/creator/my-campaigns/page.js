"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { formatDate, formatNumber, progressPercent, statusColor } from "@/lib/utils";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/campaigns/mine");
      setCampaigns(data.campaigns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/campaigns/${editing._id}`, {
        campaign_title: editing.campaign_title,
        campaign_story: editing.campaign_story,
        reward_info: editing.reward_info,
      });
      toast.success("Campaign updated.");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const { data } = await api.delete(`/campaigns/${deleting._id}`);
      toast.success(`Campaign deleted. ${data.refundedSupporters} supporters refunded.`);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading campaigns..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Campaigns</h1>

      <div className="card p-5">
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-500">You haven’t created any campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Goal</th>
                  <th>Raised</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-[220px] font-medium text-slate-800">
                      <p className="truncate">{c.campaign_title}</p>
                    </td>
                    <td>{c.category}</td>
                    <td>{formatNumber(c.funding_goal)}</td>
                    <td>
                      {formatNumber(c.amount_raised)}{" "}
                      <span className="text-xs text-slate-400">({progressPercent(c.amount_raised, c.funding_goal)}%)</span>
                    </td>
                    <td>{formatDate(c.deadline)}</td>
                    <td>
                      <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing({ ...c })}
                          className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"
                          title="Update"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Update Campaign"
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={editing.campaign_title}
                onChange={(e) => setEditing({ ...editing, campaign_title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Story</label>
              <textarea
                className="input h-28"
                value={editing.campaign_story}
                onChange={(e) => setEditing({ ...editing, campaign_story: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Reward Info</label>
              <textarea
                className="input h-20"
                value={editing.reward_info}
                onChange={(e) => setEditing({ ...editing, reward_info: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete Campaign"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleting?.campaign_title}</strong>? All approved
          supporters will be refunded their contribution credits.
        </p>
      </Modal>
    </div>
  );
}
