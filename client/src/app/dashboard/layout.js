"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sprout, Coins, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardNav, roleHome } from "@/lib/dashboardNav";
import NotificationBell from "@/components/NotificationBell";
import Loader from "@/components/Loader";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const role = user.role;
    const otherRooms = Object.keys(dashboardNav).filter((r) => r !== role);
    if (otherRooms.some((r) => pathname.startsWith(`/dashboard/${r}`))) {
      router.replace(roleHome[role]);
    }
  }, [user, pathname, router]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!user) return null;

  const nav = dashboardNav[user.role] || [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href="/" className="flex items-center gap-2 border-b px-5 py-4 text-lg font-bold text-teal-700">
          <Sprout className="h-6 w-6" /> SeedInvest
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/explore" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <Sprout className="h-5 w-5 text-teal-700" />
            <span className="font-bold text-teal-700">SeedInvest</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 sm:flex">
              <Coins className="h-4 w-4" /> {user.credits} credits
            </span>
            <NotificationBell />
            <div className="flex items-center gap-2 border-l pl-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.display_name}`}
                alt={user.display_name}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold">{user.display_name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t bg-white p-2 md:hidden">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] text-slate-600"
            >
              <Icon className="h-4 w-4" /> {label.split(" ")[0]}
            </Link>
          ))}
        </nav>

        <footer className="border-t bg-white px-6 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SeedInvest — Dashboard
        </footer>
      </div>
    </div>
  );
}
