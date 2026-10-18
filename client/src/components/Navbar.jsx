"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Menu, X, Coins, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setMenu(false);
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-700">
          <Sprout className="h-6 w-6" />
          SeedInvest
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/explore" className="text-sm font-medium text-slate-600 hover:text-teal-700">
            Explore Campaigns
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-teal-700"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <span className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                <Coins className="h-4 w-4" /> {user.credits} credits
              </span>

              <div className="relative">
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.display_name}`}
                    alt={user.display_name}
                    className="h-9 w-9 rounded-full border object-cover"
                  />
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="border-b px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.display_name}</p>
                      <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-teal-700">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
          >
            Join as Developer
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/explore" className="text-sm font-medium" onClick={() => setOpen(false)}>
              Explore Campaigns
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Dashboard ({user.credits} credits)
                </Link>
                <button onClick={handleLogout} className="text-left text-sm text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium">
              Join as Developer
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
