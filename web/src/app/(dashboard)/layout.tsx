"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Goals", href: "/dashboard#goals" },
  { label: "Privacy", href: "/dashboard#privacy" },
  { label: "Settings", href: "/dashboard#settings" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04050a] text-white">
        <p className="text-sm font-medium tracking-widest uppercase opacity-60">Loading Vita Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[32px]">
        <aside className="hidden w-72 flex-col border-r border-slate-200/70 bg-white/80 px-6 py-8 lg:flex">
          <Link className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700" href="/">
            Vita
          </Link>
          <div className="mt-8 space-y-2 text-sm font-medium text-slate-600">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 transition hover:bg-slate-950 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Logged in as</p>
            <p className="mt-1 text-lg font-semibold truncate">{user?.name || "Guest"}</p>
            <p className="mt-0.5 text-xs text-slate-400 truncate">{user?.email || "Not authenticated"}</p>
          </div>
        </aside>

        <div className="flex-1 bg-[rgba(244,246,251,0.9)] px-5 py-6 sm:px-7 lg:px-10">
          <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Welcome back, {user ? user.name : "User"}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Dashboard overview
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Sign out
              </button>
              <Link className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800" href="/register">
                Invite teammate
              </Link>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
