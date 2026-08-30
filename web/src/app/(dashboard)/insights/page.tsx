"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Brain,
  CheckCircle2,
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

export default function InsightsPage() {
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

  const focusScore =
    serverSessions.length > 0
      ? Math.round(serverSessions.reduce((acc, s) => acc + (s.flow_score || s.efficiency_score || 85), 0) / serverSessions.length)
      : 88;

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
          <span className="text-xs font-mono text-cyan-900 bg-cyan-100 px-4 py-1.5 rounded-full border border-cyan-200 shadow-2xs font-semibold">
            {focusScore}% Optimal Flow State
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

      {/* 2. MAIN VIEWPORT: Exact Original Insights View */}
      <div className="max-w-6xl w-full mx-auto flex-1 min-h-0 space-y-6 p-4 overflow-y-auto pb-24 animate-page-entrance">
        <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-cyan-700" />
              <h2 className="text-base font-semibold text-slate-900">AI Productivity Coach</h2>
            </div>
            <p className="text-xs text-slate-500">Autonomous workflow analysis & flow state optimization</p>
          </div>

          <span className="text-xs font-mono text-cyan-900 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 font-semibold">
            Active Feedback
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-semibold text-slate-900">Optimal Cognitive Windows</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your highest uninterrupted focus density occurs in the <strong>morning hours (09:00 – 12:00)</strong>. Scheduling your most demanding architectural and engineering tasks during this window boosts output by an estimated 24%.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-semibold text-slate-900">Pacing Recommendation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You currently log an average sprint block of <strong>25 minutes</strong>. Data indicates that extending deep engineering blocks to <strong>45 minutes</strong> with a 5-minute auditory rest cycle improves deep code comprehension.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold text-slate-900">Context Switching Impact</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switching between browser research and coding editors occurs approximately 8 times per focus hour. Utilizing single-window tiling reduces cognitive ramp-up latency.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FLOATING BOTTOM DOCK: Always visible pinned navigation */}
      <DockNav activeTab="insights" />
    </div>
  );
}
