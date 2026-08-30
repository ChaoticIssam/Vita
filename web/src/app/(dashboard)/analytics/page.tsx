"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Bell,
  User,
  LogOut,
  Grid,
  Calendar,
  FileText,
  PieChart,
  Bookmark,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DockNav } from "@/components/navigation/DockNav";
import { TypewriterSessionLoader } from "@/components/loader/TypewriterSessionLoader";

interface FocusSessionItem {
  id: string;
  duration_minutes: number;
  efficiency_score: number;
  flow_score?: number;
  app_name: string;
  category: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const APP_TELEMETRY_DATA: Record<string, { name: string; category: string; spentFormatted: string; pct: number; status: string }> = {
  "VS Code": { name: "VS Code", category: "Coding & Dev", spentFormatted: "3h 45m", pct: 75, status: "Active Project Workspace" },
  "Cursor": { name: "Cursor", category: "Coding & Dev", spentFormatted: "2h 30m", pct: 50, status: "AI Pair Programming" },
  "Terminal": { name: "Terminal", category: "Coding & Dev", spentFormatted: "1h 15m", pct: 25, status: "Build Scripts & Tests" },
  "Xcode": { name: "Xcode", category: "Coding & Dev", spentFormatted: "4h 10m", pct: 85, status: "iOS Swift App Debugging" },
  "Figma": { name: "Figma", category: "Design & UI", spentFormatted: "1h 15m", pct: 15, status: "Design Tokens & Wireframes" },
  "Adobe Illustrator": { name: "Adobe Illustrator", category: "Design & UI", spentFormatted: "1h 45m", pct: 35, status: "Vector Illustration" },
  "Safari": { name: "Safari", category: "Reading & Research", spentFormatted: "2h 15m", pct: 24, status: "Documentation Browsing" },
  "Chrome": { name: "Chrome", category: "Reading & Research", spentFormatted: "1h 00m", pct: 10, status: "Web Research" },
  "Notion": { name: "Notion", category: "Writing & Docs", spentFormatted: "1h 30m", pct: 57, status: "Knowledge Base & Specs" },
  "Obsidian": { name: "Obsidian", category: "Writing & Docs", spentFormatted: "1h 10m", pct: 45, status: "Markdown Notes" },
  "Jupyter": { name: "Jupyter", category: "Data & Analytics", spentFormatted: "2h 00m", pct: 50, status: "Data Science Notebooks" },
  "TablePlus": { name: "TablePlus", category: "Data & Analytics", spentFormatted: "1h 25m", pct: 40, status: "SQL Querying" },
  "Linear": { name: "Linear", category: "Product & Strategy", spentFormatted: "1h 05m", pct: 25, status: "Sprint Planning" },
  "Slack": { name: "Slack", category: "Product & Strategy", spentFormatted: "2h 05m", pct: 72, status: "Team Coordination" },
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [serverSessions, setServerSessions] = useState<FocusSessionItem[]>([]);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState<boolean>(true);

  // Header State
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      if (!token) {
        setIsInitialDataLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: FocusSessionItem[] = await res.json();
          setServerSessions(data);
        }
      } catch {} finally {
        setIsInitialDataLoading(false);
      }
    }
    fetchSessions();
  }, [token]);

  const handleExportCSV = () => {
    const headers = ["ID", "Application", "Category", "Duration (Minutes)", "Efficiency Score (%)", "Flow Score (%)", "Timestamp"];
    const rows = serverSessions.map((s) => [
      s.id,
      `"${s.app_name}"`,
      `"${s.category}"`,
      s.duration_minutes,
      s.efficiency_score,
      s.flow_score || s.efficiency_score || 85,
      `"${s.created_at}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vita_analytics_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dailyFocusHours = serverSessions
    .filter((s) => s.created_at && new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.duration_minutes / 60, 0);

  if (isInitialDataLoading) {
    return <TypewriterSessionLoader />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e4e7e4] text-slate-800 font-sans select-none antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* 1. TOP HEADER: Clean Brand Name Only (Exact Match to Dashboard) */}
      <header className="w-full flex items-center justify-between pb-4 shrink-0 select-none">
        {/* Left Header Column: Clean Brand Name Only */}
        <div className="w-72 lg:w-80 flex items-center shrink-0">
          <h1 className="font-[family-name:var(--font-hubballi)] text-4xl font-normal leading-none tracking-tight text-slate-900">
            vita
          </h1>
        </div>

        {/* Center Header Column */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          <span className="text-xs font-mono text-slate-600 bg-white/80 px-4 py-1.5 rounded-full border border-white/90 shadow-2xs font-medium">
            Telemetry & Focus Analytics
          </span>
        </div>

        {/* Right Header Column */}
        <div className="w-72 lg:w-80 flex items-center justify-end space-x-2 shrink-0">
          {/* Action Button: Focus Alerts & Notifications */}
          <button
            onClick={() => setNotificationActive(!notificationActive)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${
              notificationActive ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"
            }`}
            title="Toggle Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* User Profile & Account Menu */}
          <div ref={userMenuRef} className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden text-white font-medium flex items-center justify-center shadow-xs hover:ring-2 hover:ring-slate-400 transition cursor-pointer hover:scale-105 active:scale-95 shrink-0 border border-white/40"
              title="User Account Menu"
            >
              {user?.avatar_url && user.avatar_url.startsWith("preset:emerald") ? (
                <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:indigo") ? (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-800 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || "user@example.com"}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT: Exact Original Analytics View */}
      <div className="max-w-6xl w-full mx-auto space-y-6 p-4 overflow-y-auto max-h-full pb-24 animate-page-entrance">
        {/* Top Banner Row */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Analytics & Time Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Deep focus activity metrics classified across your 6 primary disciplines</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
            title="Export Analytics Data as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Main 2-Column Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Digital Activity Distribution */}
          <div className="lg:col-span-6 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-4">
            <span className="text-xs font-semibold text-slate-900 block">Digital Activity Category Distribution</span>

            {(() => {
              let devSecs = 0, designSecs = 0, writingSecs = 0, researchSecs = 0, dataSecs = 0, productSecs = 0;

              serverSessions.forEach((s) => {
                const secs = s.duration_minutes * 60;
                const cat = s.category;
                if (cat === "Coding & Dev" || cat === "Engineering") devSecs += secs;
                else if (cat === "Design & UI" || cat === "Design") designSecs += secs;
                else if (cat === "Writing & Docs" || cat === "Productivity") writingSecs += secs;
                else if (cat === "Reading & Research" || cat === "Research") researchSecs += secs;
                else if (cat === "Data & Analytics") dataSecs += secs;
                else productSecs += secs;
              });

              Object.keys(APP_TELEMETRY_DATA).forEach((app) => {
                const cat = APP_TELEMETRY_DATA[app]?.category || "Coding & Dev";
                const secs = 1800;
                if (cat === "Coding & Dev" || cat === "Engineering") devSecs += secs;
                else if (cat === "Design & UI" || cat === "Design") designSecs += secs;
                else if (cat === "Writing & Docs" || cat === "Productivity") writingSecs += secs;
                else if (cat === "Reading & Research" || cat === "Research") researchSecs += secs;
                else if (cat === "Data & Analytics") dataSecs += secs;
                else productSecs += secs;
              });

              const total = devSecs + designSecs + writingSecs + researchSecs + dataSecs + productSecs || 1;
              const devPct = Math.round((devSecs / total) * 100);
              const designPct = Math.round((designSecs / total) * 100);
              const writingPct = Math.round((writingSecs / total) * 100);
              const researchPct = Math.round((researchSecs / total) * 100);
              const dataPct = Math.round((dataSecs / total) * 100);
              const productPct = Math.round((productSecs / total) * 100);

              return (
                <>
                  <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${devPct}%` }} title={`Coding & Dev (${devPct}%)`} />
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${designPct}%` }} title={`Design & UI (${designPct}%)`} />
                    <div className="h-full bg-slate-700 transition-all duration-500" style={{ width: `${writingPct}%` }} title={`Writing & Docs (${writingPct}%)`} />
                    <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${researchPct}%` }} title={`Reading & Research (${researchPct}%)`} />
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${dataPct}%` }} title={`Data & Analytics (${dataPct}%)`} />
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${productPct}%` }} title={`Product & Strategy (${productPct}%)`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Coding & Dev</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(devSecs / 3600).toFixed(1)} hrs ({devPct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Design & UI</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(designSecs / 3600).toFixed(1)} hrs ({designPct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Writing & Docs</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(writingSecs / 3600).toFixed(1)} hrs ({writingPct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Reading & Research</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(researchSecs / 3600).toFixed(1)} hrs ({researchPct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Data & Analytics</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(dataSecs / 3600).toFixed(1)} hrs ({dataPct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <div>
                        <span className="text-slate-800 font-medium block">Product & Strategy</span>
                        <span className="text-[10px] text-slate-500 font-mono">{(productSecs / 3600).toFixed(1)} hrs ({productPct}%)</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Right Column: Weekly Deep Work Bar Chart */}
          <div className="lg:col-span-6 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">Weekly Deep Focus Distribution</span>
              <span className="text-[10px] text-slate-500 font-mono">{dailyFocusHours.toFixed(1)}h logged today</span>
            </div>

            <div className="h-44 flex items-end justify-between px-6 pt-6 pb-2 border-b border-slate-200">
              {(() => {
                const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const dailyMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

                serverSessions.forEach((s) => {
                  const date = new Date(s.created_at);
                  const dayStr = daysOfWeek[date.getDay()];
                  if (dailyMap[dayStr] !== undefined) {
                    dailyMap[dayStr] += s.duration_minutes / 60;
                  }
                });

                const todayStr = daysOfWeek[new Date().getDay()];
                if (dailyMap[todayStr] !== undefined && dailyFocusHours > dailyMap[todayStr]) {
                  dailyMap[todayStr] = dailyFocusHours;
                }

                const maxDayHours = Math.max(1.0, ...Object.values(dailyMap));

                return [
                  { day: "Mon", focus: Math.round((dailyMap.Mon / maxDayHours) * 100) },
                  { day: "Tue", focus: Math.round((dailyMap.Tue / maxDayHours) * 100) },
                  { day: "Wed", focus: Math.round((dailyMap.Wed / maxDayHours) * 100) },
                  { day: "Thu", focus: Math.round((dailyMap.Thu / maxDayHours) * 100) },
                  { day: "Fri", focus: Math.round((dailyMap.Fri / maxDayHours) * 100) },
                  { day: "Sat", focus: Math.round((dailyMap.Sat / maxDayHours) * 100) },
                  { day: "Sun", focus: Math.round((dailyMap.Sun / maxDayHours) * 100) },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1.5 group">
                    <div className="w-8 bg-slate-200 rounded-t-md flex flex-col justify-end overflow-hidden" style={{ height: "120px" }}>
                      <div className="w-full bg-[#181a1b] group-hover:bg-slate-800 transition-all duration-300 rounded-t-md" style={{ height: `${bar.focus}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">{bar.day}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLOATING BOTTOM DOCK: Always visible pinned navigation */}
      <DockNav activeTab="analytics" />
    </div>
  );
}
