"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { formatNumber } from "@/lib/utils";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success("Role updated.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/users/${deleting.id}`);
      toast.success("User removed.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader label="Loading users..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.display_name}`}
                        alt={u.display_name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">{u.display_name}</span>
                    </div>
                  </td>
                  <td className="text-slate-600">{u.user_email}</td>
                  <td>
                    <select
                      className="input py-1 text-xs"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="supporter">Supporter</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{formatNumber(u.credits)}</td>
                  <td>
                    <button
                      onClick={() => setDeleting(u)}
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
        title="Remove User"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={remove}>
              Remove
            </button>
          </>
        }
      >
        <p>
          Remove <strong>{deleting?.display_name}</strong> from the platform? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
