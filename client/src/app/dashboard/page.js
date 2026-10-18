"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { roleHome } from "@/lib/dashboardNav";
import Loader from "@/components/Loader";

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace(roleHome[user.role] || "/dashboard/supporter");
  }, [user, loading, router]);

  return <Loader label="Redirecting..." />;
}
