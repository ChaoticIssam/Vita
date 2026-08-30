"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Grid,
  Calendar,
  FileText,
  PieChart,
  Bookmark,
  Shield,
} from "lucide-react";

interface DockNavProps {
  activeTab?: "overview" | "calendar" | "tasks" | "analytics" | "insights" | "settings";
}

export function DockNav({ activeTab }: DockNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentActive =
    activeTab ||
    (pathname === "/calendar"
      ? "calendar"
      : pathname === "/tasks"
      ? "tasks"
      : pathname === "/analytics"
      ? "analytics"
      : pathname === "/insights"
      ? "insights"
      : pathname === "/settings"
      ? "settings"
      : "overview");

  const navItems = [
    { id: "overview", path: "/dashboard", label: "Overview", icon: Grid },
    { id: "calendar", path: "/calendar", label: "Activity Calendar", icon: Calendar },
    { id: "tasks", path: "/tasks", label: "Focus Tasks", icon: FileText },
    { id: "analytics", path: "/analytics", label: "Analytics", icon: PieChart },
    { id: "insights", path: "/insights", label: "AI Insights", icon: Bookmark },
    { id: "settings", path: "/settings", label: "Privacy Settings", icon: Shield },
  ];

  return (
    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto">
      <nav
        aria-label="Application Dock Navigation"
        className="flex items-center space-x-3 bg-white/80 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.8)] transition-all duration-300"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              title={item.label}
              className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "w-10 h-10 bg-[#181a1b] text-white shadow-[0_4px_16px_rgba(0,0,0,0.28)] hover:scale-105 active:scale-95"
                  : "w-8 h-8 text-slate-700 hover:text-slate-950 hover:bg-white/60 hover:scale-105 active:scale-95"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
