"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Target, Clock, Gift, Flag } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { daysLeft, formatDate, formatNumber, progressPercent } from "@/lib/utils";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/campaigns/${id}`);
      setCampaign(data.campaign);
      const contrib = await api.get(`/contributions/campaign/${id}/approved`);
      setContributions(contrib.data.contributions);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const contribute = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to contribute.");
      router.push("/login");
      return;
    }
    if (user.role !== "supporter") {
      toast.error("Only supporters can contribute.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/contributions/campaign/${id}`, {
        contribution_amount: Number(amount),
      });
      toast.success("Contribution submitted for review!");
      setAmount("");
      setContributions(data.contribution ? [data.contribution, ...contributions] : contributions);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please describe the issue.");
      return;
    }
    try {
      await api.post("/reports", { campaign_id: id, reason: reportReason });
      toast.success("Report submitted. Thank you.");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading campaign..." />;
  if (!campaign)
    return <p className="py-16 text-center text-slate-500">Campaign not found.</p>;

  const percent = progressPercent(campaign.amount_raised, campaign.funding_goal);
  const closed = new Date(campaign.deadline) < new Date() || campaign.status !== "approved";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.campaign_image_url || "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200"}
              alt={campaign.campaign_title}
              className="h-72 w-full object-cover"
            />
            <div className="p-6">
              <span className="badge bg-teal-50 text-teal-700">{campaign.category}</span>
              <h1 className="mt-3 text-2xl font-bold md:text-3xl">{campaign.campaign_title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <Users className="h-4 w-4" /> by {campaign.creator_name}
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {campaign.campaign_story}
              </p>

              {campaign.reward_info && (
                <div className="mt-5 flex gap-3 rounded-lg bg-slate-50 p-4">
                  <Gift className="h-5 w-5 shrink-0 text-teal-600" />
                  <div>
                    <p className="text-sm font-semibold">Rewards</p>
                    <p className="text-sm text-slate-600">{campaign.reward_info}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-6 p-6">
            <h2 className="text-lg font-semibold">Recent backers</h2>
            {contributions.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No approved contributions yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {contributions.slice(0, 10).map((c) => (
                  <li key={c._id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{c.supporter_name}</span>
                    <span className="text-teal-700">{formatNumber(c.contribution_amount)} credits</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-slate-900">
                {formatNumber(campaign.amount_raised)}
              </p>
              <p className="text-sm text-slate-500">of {formatNumber(campaign.funding_goal)} credits</p>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1 text-right text-xs font-medium text-teal-700">{percent}% funded</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" /> {daysLeft(campaign.deadline)} days left
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Target className="h-4 w-4 text-slate-400" /> min {campaign.minimum_contribution}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Deadline: {formatDate(campaign.deadline)}</p>

            <form onSubmit={contribute} className="mt-5 space-y-3">
              <div>
                <label className="label">Contribution amount (credits)</label>
                <input
                  type="number"
                  min={campaign.minimum_contribution}
                  className="input"
                  placeholder={`Min ${campaign.minimum_contribution}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={closed}
                />
              </div>
              {closed ? (
                <p className="rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-500">
                  This campaign is closed for contributions.
                </p>
              ) : (
                <button type="submit" className="btn-primary w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Contribute"}
                </button>
              )}
            </form>

            {user?.role === "supporter" && (
              <button
                onClick={() => setReportOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-500 hover:text-red-600"
              >
                <Flag className="h-3.5 w-3.5" /> Report this campaign
              </button>
            )}
          </div>
        </aside>
      </div>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report campaign"
        footer={
          <>
            <button className="btn-outline" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={submitReport}>
              Submit Report
            </button>
          </>
        }
      >
        <p className="mb-2 text-slate-600">
          Report this campaign as suspicious or fraudulent. Our admins will review it.
        </p>
        <textarea
          className="input h-28"
          placeholder="Describe the issue..."
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
