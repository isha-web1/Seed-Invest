"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import api from "@/lib/api";
import CampaignCard from "@/components/CampaignCard";
import Loader from "@/components/Loader";
import { categories } from "@/data/static";

function ExploreInner() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: "",
    sort: "newest",
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;
      const { data } = await api.get("/campaigns/explore", { params });
      setCampaigns(data.campaigns);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold md:text-3xl">Explore Campaigns</h1>
      <p className="mt-1 text-slate-500">Back the projects that inspire you.</p>

      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="deadline">Ending soon</option>
          <option value="progress">Most funded</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading campaigns..." />
      ) : campaigns.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">
          No campaigns match your filters yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c._id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<Loader label="Loading..." />}>
      <ExploreInner />
    </Suspense>
  );
}
