"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { formatDate, formatNumber, statusColor } from "@/lib/utils";

export default function MyContributions() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 5 };
        if (status) params.status = status;
        const res = await api.get("/contributions/mine", { params });
        setData(res.data.contributions);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Contributions</h1>
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card p-5">
        {loading ? (
          <Loader label="Loading contributions..." />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-500">No contributions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Creator</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-slate-800">{c.campaign_title}</td>
                    <td>{c.creator_name}</td>
                    <td>{formatNumber(c.contribution_amount)} credits</td>
                    <td>{formatDate(c.current_date)}</td>
                    <td>
                      <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={(p) => load(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
