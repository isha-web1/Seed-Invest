"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import { categories } from "@/data/static";

const initial = {
  campaign_title: "",
  campaign_story: "",
  category: "Technology",
  funding_goal: "",
  minimum_contribution: "",
  deadline: "",
  reward_info: "",
  campaign_image_url: "",
};

export default function AddCampaign() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.campaign_title.trim()) e.campaign_title = "Title is required.";
    if (!form.campaign_story.trim()) e.campaign_story = "Story is required.";
    if (!form.funding_goal || Number(form.funding_goal) <= 0) e.funding_goal = "Enter a valid funding goal.";
    if (!form.minimum_contribution || Number(form.minimum_contribution) <= 0)
      e.minimum_contribution = "Enter a valid minimum contribution.";
    if (!form.deadline) e.deadline = "Deadline is required.";
    else if (new Date(form.deadline) < new Date()) e.deadline = "Deadline must be in the future.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post("/campaigns", {
        ...form,
        funding_goal: Number(form.funding_goal),
        minimum_contribution: Number(form.minimum_contribution),
      });
      toast.success("Campaign submitted for approval!");
      router.push("/dashboard/creator/my-campaigns");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Campaign</h1>
      <p className="text-sm text-slate-500">
        Your campaign will be visible to supporters once an admin approves it.
      </p>

      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <div>
          <label className="label">Campaign Title</label>
          <input
            className="input"
            placeholder="Help us build a solar-powered water pump"
            value={form.campaign_title}
            onChange={set("campaign_title")}
          />
          {errors.campaign_title && <p className="mt-1 text-xs text-red-600">{errors.campaign_title}</p>}
        </div>

        <div>
          <label className="label">Campaign Story</label>
          <textarea
            className="input h-32"
            placeholder="Tell supporters about your project..."
            value={form.campaign_story}
            onChange={set("campaign_story")}
          />
          {errors.campaign_story && <p className="mt-1 text-xs text-red-600">{errors.campaign_story}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set("category")}>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={set("deadline")} />
            {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Funding Goal (credits)</label>
            <input type="number" min="1" className="input" value={form.funding_goal} onChange={set("funding_goal")} />
            {errors.funding_goal && <p className="mt-1 text-xs text-red-600">{errors.funding_goal}</p>}
          </div>
          <div>
            <label className="label">Minimum Contribution (credits)</label>
            <input
              type="number"
              min="1"
              className="input"
              value={form.minimum_contribution}
              onChange={set("minimum_contribution")}
            />
            {errors.minimum_contribution && (
              <p className="mt-1 text-xs text-red-600">{errors.minimum_contribution}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label">Reward Info</label>
          <textarea
            className="input h-24"
            placeholder="What will supporters receive for pledging?"
            value={form.reward_info}
            onChange={set("reward_info")}
          />
        </div>

        <ImageUploader
          label="Campaign Cover Image"
          value={form.campaign_image_url}
          onChange={(url) => setForm({ ...form, campaign_image_url: url })}
        />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Add Campaign"}
        </button>
      </form>
    </div>
  );
}
