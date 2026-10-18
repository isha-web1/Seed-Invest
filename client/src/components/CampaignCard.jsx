import Link from "next/link";
import { Users } from "lucide-react";
import { daysLeft, formatNumber, progressPercent } from "@/lib/utils";

export default function CampaignCard({ campaign }) {
  const percent = progressPercent(campaign.amount_raised, campaign.funding_goal);

  return (
    <div className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.campaign_image_url || "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200"}
          alt={campaign.campaign_title}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 badge bg-white/90 text-teal-700">
          {campaign.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold text-slate-900">
          {campaign.campaign_title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" /> by {campaign.creator_name}
        </p>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            {formatNumber(campaign.amount_raised)} credits
          </span>
          <span>of {formatNumber(campaign.funding_goal)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">{daysLeft(campaign.deadline)} days left</span>
          <Link href={`/campaign/${campaign._id}`} className="btn-primary px-3 py-1.5 text-xs">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
