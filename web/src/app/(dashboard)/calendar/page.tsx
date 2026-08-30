"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Calendar,
  Grid,
  FileText,
  PieChart,
  Bookmark,
  Shield,
  Bell,
  User,
  LogOut,
  X,
  Sparkles,
  Trash2,
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

export default function CalendarPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [timelineFilter, setTimelineFilter] = useState<"daily" | "monthly" | "yearly">("daily");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<number>(new Date().getMonth());
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<number>(new Date().getFullYear());
  const [serverSessions, setServerSessions] = useState<FocusSessionItem[]>([]);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<FocusSessionItem | null>(null);
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

  // Fetch Focus Sessions from API
  const fetchSessions = async () => {
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
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const handleDeleteSession = async (sessionId: string) => {
    setServerSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (token) {
      try {
        await fetch(`${API_BASE}/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSessions();
      } catch {}
    }
  };

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

        {/* Center Header Column: Integrated Scope Selector Pills */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-2xs">
            <button
              onClick={() => setTimelineFilter("daily")}
              className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${
                timelineFilter === "daily" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimelineFilter("monthly")}
              className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${
                timelineFilter === "monthly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimelineFilter("yearly")}
              className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${
                timelineFilter === "yearly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Right Header Column: Bell & User Menu */}
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

      {/* 2. MAIN VIEWPORT: Exact Original Calendar View */}
      <div className="max-w-6xl w-full mx-auto h-full flex flex-col min-h-0 space-y-4 p-2 sm:p-4 pb-20 animate-page-entrance overflow-hidden">
        {timelineFilter === "daily" ? (
          /* SCOPE 1: DAILY 24-HOUR CONTINUOUS TIMELINE GRID */
          <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-hidden">
            {/* Top 7-Day Day Selector Strip */}
            <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-3xl border border-white/70 shadow-xs space-y-2.5 shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-cyan-700" />
                  <span className="text-xs font-semibold text-slate-900">
                    {selectedCalendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-white/90">
                  {selectedCalendarDate.toDateString() === new Date().toDateString() ? "Current Week" : selectedCalendarDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const monday = new Date(selectedCalendarDate);
                  const dayOfWeek = monday.getDay();
                  const diffToMonday = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                  monday.setDate(diffToMonday);

                  const todayDateOnly = new Date();
                  todayDateOnly.setHours(0, 0, 0, 0);

                  const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);

                    const dDateOnly = new Date(d);
                    dDateOnly.setHours(0, 0, 0, 0);

                    const isSelected = d.toDateString() === selectedCalendarDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();
                    const isFuture = dDateOnly.getTime() > todayDateOnly.getTime();

                    const daySessions = serverSessions.filter((s) => {
                      if (!s.created_at) return false;
                      return new Date(s.created_at).toDateString() === d.toDateString();
                    });

                    const totalHours = daySessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);

                    return {
                      dateObj: d,
                      day: d.toLocaleDateString("en-US", { weekday: "short" }),
                      date: d.getDate().toString(),
                      hrs: totalHours,
                      active: isSelected,
                      isToday,
                      isFuture,
                      sessionCount: daySessions.length,
                    };
                  });

                  return days.map((d) => (
                    <div
                      key={d.day + d.date}
                      onClick={d.isFuture ? undefined : () => setSelectedCalendarDate(d.dateObj)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-between h-18 border transition select-none ${
                        d.isFuture
                          ? "bg-slate-200/70 text-slate-400 border-slate-300/50 cursor-not-allowed opacity-60"
                          : d.active
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/50 text-slate-700 border-white/70 hover:bg-white/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      <span className={`text-[10px] font-mono ${d.active ? "text-slate-300" : "text-slate-500"}`}>{d.day}</span>
                      <span className={`text-sm font-semibold ${d.isFuture ? "text-slate-400" : d.active ? "text-white" : "text-slate-800"}`}>{d.date}</span>
                      <span className={`text-[10px] font-mono ${d.isFuture ? "text-slate-400" : d.active ? "text-cyan-200 font-medium" : "text-slate-400"}`}>
                        {d.isFuture ? "—" : `${d.hrs.toFixed(1)}h`}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* 24-Hour Chronological Timeline Feed */}
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden">
              {(() => {
                const daySessions = serverSessions.filter((s) => {
                  if (!s.created_at) return false;
                  return new Date(s.created_at).toDateString() === selectedCalendarDate.toDateString();
                });

                const selectedDayHours = daySessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);
                const blockCount = daySessions.length;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 shrink-0 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">24-Hour Daily Timeline Schedule</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedCalendarDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} • {selectedDayHours.toFixed(1)} hrs tracked
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-700 bg-white/80 px-3 py-1 rounded-full border border-slate-200 font-medium">
                        {blockCount} {blockCount === 1 ? "Focus Block" : "Focus Blocks"}
                      </span>
                    </div>

                    {/* Continuous 24-Hour Timeline Grid View */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 relative custom-scrollbar">
                      {(() => {
                        const HOUR_HEIGHT = 84;
                        const minToPx = HOUR_HEIGHT / 60;
                        const MIN_CARD_HEIGHT = 56;
                        const VERTICAL_GAP = 5;

                        const parsed = daySessions
                          .map((s) => {
                            const sDate = s.created_at ? new Date(s.created_at) : new Date();
                            const startMin = sDate.getHours() * 60 + sDate.getMinutes();
                            const dur = Math.max(1, s.duration_minutes || 25);
                            const endMin = startMin + dur;
                            const topPx = startMin * minToPx;
                            const heightPx = Math.max(MIN_CARD_HEIGHT, dur * minToPx);
                            const visualBottomPx = topPx + heightPx;
                            return { session: s, sDate, startMin, endMin, duration: dur, topPx, heightPx, visualBottomPx };
                          })
                          .sort((a, b) => a.topPx - b.topPx || b.duration - a.duration);

                        const clusters: typeof parsed[] = [];
                        let currentCluster: typeof parsed = [];
                        let currentClusterBottom = -1;

                        for (const item of parsed) {
                          if (currentCluster.length === 0) {
                            currentCluster = [item];
                            currentClusterBottom = item.visualBottomPx;
                          } else if (item.topPx < currentClusterBottom + VERTICAL_GAP) {
                            currentCluster.push(item);
                            currentClusterBottom = Math.max(currentClusterBottom, item.visualBottomPx);
                          } else {
                            clusters.push(currentCluster);
                            currentCluster = [item];
                            currentClusterBottom = item.visualBottomPx;
                          }
                        }
                        if (currentCluster.length > 0) {
                          clusters.push(currentCluster);
                        }

                        interface PositionedItem {
                          session: FocusSessionItem;
                          sDate: Date;
                          startMin: number;
                          endMin: number;
                          duration: number;
                          topPx: number;
                          heightPx: number;
                          colIndex: number;
                          totalCols: number;
                        }

                        const positionedSessions: PositionedItem[] = [];

                        for (const cluster of clusters) {
                          const columnBottoms: number[] = [];
                          const clusterAssigned: { item: typeof parsed[0]; col: number }[] = [];

                          for (const item of cluster) {
                            let placedCol = -1;
                            for (let c = 0; c < columnBottoms.length; c++) {
                              if (columnBottoms[c] + VERTICAL_GAP <= item.topPx) {
                                placedCol = c;
                                columnBottoms[c] = item.visualBottomPx;
                                break;
                              }
                            }
                            if (placedCol === -1) {
                              placedCol = columnBottoms.length;
                              columnBottoms.push(item.visualBottomPx);
                            }
                            clusterAssigned.push({ item, col: placedCol });
                          }

                          const totalCols = columnBottoms.length;

                          for (const ca of clusterAssigned) {
                            positionedSessions.push({
                              session: ca.item.session,
                              sDate: ca.item.sDate,
                              startMin: ca.item.startMin,
                              endMin: ca.item.endMin,
                              duration: ca.item.duration,
                              topPx: ca.item.topPx,
                              heightPx: ca.item.heightPx,
                              colIndex: ca.col,
                              totalCols,
                            });
                          }
                        }

                        return (
                          <div className="relative h-[2016px] w-full flex">
                            <div className="w-16 shrink-0 relative select-none">
                              {Array.from({ length: 24 }, (_, h) => {
                                const period = h < 12 ? "AM" : "PM";
                                const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                const timeStr = `${displayHour < 10 ? "0" : ""}${displayHour}:00 ${period}`;
                                return (
                                  <div
                                    key={h}
                                    style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                    className="absolute left-0 right-0 font-mono text-[11px] text-slate-400 text-right pr-3 -mt-2"
                                  >
                                    {timeStr}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex-1 relative border-l-2 border-slate-200">
                              {Array.from({ length: 24 }, (_, h) => (
                                <div
                                  key={h}
                                  style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                  className="absolute left-0 right-0 border-t border-slate-200/60 pointer-events-none"
                                >
                                  <div className="absolute -left-[5px] -top-[4px] w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                              ))}

                              {positionedSessions.map((pos) => {
                                const s = pos.session;
                                const startTime = pos.sDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                const endDate = new Date(pos.sDate.getTime() + pos.duration * 60000);
                                const endTime = endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                                const isPersonal =
                                  s.category?.toLowerCase().includes("health") ||
                                  s.category?.toLowerCase().includes("gym") ||
                                  s.category?.toLowerCase().includes("personal");
                                const isAdmin =
                                  s.category?.toLowerCase().includes("admin") ||
                                  s.category?.toLowerCase().includes("routine") ||
                                  s.category?.toLowerCase().includes("mail");
                                const isDesign = s.category?.toLowerCase().includes("design") || s.category?.toLowerCase().includes("ui");

                                const accentBorder = isPersonal
                                  ? "border-l-4 border-l-rose-500"
                                  : isAdmin
                                    ? "border-l-4 border-l-teal-600"
                                    : isDesign
                                      ? "border-l-4 border-l-indigo-600"
                                      : "border-l-4 border-l-cyan-600";

                                const colWidthPct = 100 / pos.totalCols;
                                const leftPct = pos.colIndex * colWidthPct;

                                return (
                                  <div
                                    key={s.id}
                                    onClick={() => setSelectedSessionDetail(s)}
                                    style={{
                                      top: `${pos.topPx + 2}px`,
                                      height: `${pos.heightPx}px`,
                                      left: `calc(${leftPct}% + 4px)`,
                                      width: `calc(${colWidthPct}% - 8px)`,
                                    }}
                                    className={`absolute z-10 bg-white/95 hover:bg-white p-2.5 sm:p-3 rounded-xl border border-white/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${accentBorder}`}
                                  >
                                    <div className="flex items-start justify-between gap-1.5 min-w-0">
                                      <div className="min-w-0 flex-1">
                                        <span className="text-xs font-semibold text-slate-900 block truncate" title={s.app_name}>
                                          {s.app_name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                                          {startTime} - {endTime}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-1 shrink-0">
                                        <span className="text-[9px] font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                                          {Math.round(s.flow_score || s.efficiency_score || 85)}% Flow
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(s.id);
                                          }}
                                          className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                          title="Remove from Calendar"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {pos.heightPx >= 70 && (
                                      <div className="flex items-center justify-between text-xs pt-1 mt-1 border-t border-slate-100 text-slate-600 shrink-0">
                                        <span className="text-[10px] truncate mr-1">
                                          Category: <strong className="text-slate-800 font-medium">{s.category}</strong>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 shrink-0">
                                          {s.duration_minutes}m
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : timelineFilter === "monthly" ? (
          /* SCOPE 2: 31-DAY MONTHLY CALENDAR GRID */
          <div className="flex-1 min-h-0 overflow-y-auto bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-xs space-y-6 pb-6 custom-scrollbar">
            {(() => {
              const monthDate = new Date(selectedCalendarYear, selectedCalendarMonth, 1);
              const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
              const fullMonthName = monthDate.toLocaleDateString("en-US", { month: "long" });
              const totalDays = new Date(selectedCalendarYear, selectedCalendarMonth + 1, 0).getDate();
              const firstDayIndex = (new Date(selectedCalendarYear, selectedCalendarMonth, 1).getDay() + 6) % 7;

              const monthSessions = serverSessions.filter((s) => {
                if (!s.created_at) return false;
                const d = new Date(s.created_at);
                return d.getMonth() === selectedCalendarMonth && d.getFullYear() === selectedCalendarYear;
              });

              const monthTotalHours = monthSessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);

              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{fullMonthName} {selectedCalendarYear} Monthly Grid</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{totalDays}-day activity distribution & focus intensity</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-cyan-900 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 font-medium">
                        {monthTotalHours.toFixed(1)}h Month Total
                      </span>
                      <div className="flex items-center space-x-1 bg-white p-1 rounded-full border border-slate-200">
                        <button
                          onClick={() => {
                            if (selectedCalendarMonth === 0) {
                              setSelectedCalendarMonth(11);
                              setSelectedCalendarYear((prev) => prev - 1);
                            } else {
                              setSelectedCalendarMonth((prev) => prev - 1);
                            }
                          }}
                          className="px-2.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition"
                          title="Previous Month"
                        >
                          ←
                        </button>
                        <span className="text-xs font-semibold text-slate-800 px-2 min-w-[70px] text-center">
                          {monthName} {selectedCalendarYear}
                        </span>
                        <button
                          onClick={() => {
                            if (selectedCalendarMonth === 11) {
                              setSelectedCalendarMonth(0);
                              setSelectedCalendarYear((prev) => prev + 1);
                            } else {
                              setSelectedCalendarMonth((prev) => prev + 1);
                            }
                          }}
                          className="px-2.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition"
                          title="Next Month"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 pb-1">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayIndex }, (_, i) => (
                      <div key={`pad-${i}`} className="min-h-[76px] rounded-2xl opacity-20 border border-dashed border-slate-300" />
                    ))}

                    {Array.from({ length: totalDays }, (_, i) => {
                      const dayNum = i + 1;
                      const cellDate = new Date(selectedCalendarYear, selectedCalendarMonth, dayNum);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const cellDateOnly = new Date(cellDate);
                      cellDateOnly.setHours(0, 0, 0, 0);

                      const isToday = cellDateOnly.getTime() === today.getTime();
                      const isFuture = cellDateOnly.getTime() > today.getTime();
                      const isPast = cellDateOnly.getTime() < today.getTime();

                      const daySessions = serverSessions.filter((s) => {
                        if (!s.created_at) return false;
                        const d = new Date(s.created_at);
                        return d.getFullYear() === selectedCalendarYear && d.getMonth() === selectedCalendarMonth && d.getDate() === dayNum;
                      });

                      const hrs = daySessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);
                      const sessionCount = daySessions.length;

                      return (
                        <div
                          key={dayNum}
                          onClick={
                            isFuture
                              ? undefined
                              : () => {
                                  setSelectedCalendarDate(cellDate);
                                  setTimelineFilter("daily");
                                }
                          }
                          className={`min-h-[76px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all select-none ${
                            isFuture
                              ? "bg-slate-200/70 text-slate-400 border-slate-300/50 cursor-not-allowed opacity-60"
                              : isToday
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-cyan-500/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                : hrs > 0
                                  ? "bg-cyan-50/80 hover:bg-cyan-100 text-slate-800 border-cyan-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                  : "bg-white/50 hover:bg-white/80 text-slate-700 border-white/70 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isFuture ? "text-slate-400" : isToday ? "text-white" : "text-slate-800"}`}>{dayNum}</span>
                            {hrs > 0 && !isFuture && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${isToday ? "bg-cyan-900 text-cyan-200" : "bg-cyan-100 text-cyan-900"}`}>
                                {hrs.toFixed(1)}h
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] font-mono">
                            {hrs > 0 && !isFuture ? (
                              <span className={isToday ? "text-cyan-300 font-medium" : "text-cyan-800 font-medium"}>
                                {sessionCount} {sessionCount === 1 ? "Sprint" : "Sprints"}
                              </span>
                            ) : isToday ? (
                              <span className="text-slate-400">Today</span>
                            ) : isPast ? (
                              <span className="text-slate-400">Rest</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          /* SCOPE 3: 12-MONTH ANNUAL FOCUS MATRIX */
          <div className="flex-1 min-h-0 overflow-y-auto bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-xs space-y-6 pb-6 custom-scrollbar">
            {(() => {
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ];

              const annualSessions = serverSessions.filter((s) => {
                if (!s.created_at) return false;
                return new Date(s.created_at).getFullYear() === selectedCalendarYear;
              });

              const annualTotalHours = annualSessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);

              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{selectedCalendarYear} Annual Focus Matrix</h3>
                      <p className="text-xs text-slate-500 mt-0.5">12-month annual focus trends and total volume breakdown</p>
                    </div>

                    <span className="text-xs font-mono text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-200 font-semibold">
                      {annualTotalHours.toFixed(1)}h Total {selectedCalendarYear} Focus
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {months.map((monthName, mIdx) => {
                      const isCurrentMonth = mIdx === new Date().getMonth() && selectedCalendarYear === new Date().getFullYear();
                      const isFutureMonth =
                        selectedCalendarYear > new Date().getFullYear() ||
                        (selectedCalendarYear === new Date().getFullYear() && mIdx > new Date().getMonth());

                      const mSessions = serverSessions.filter((s) => {
                        if (!s.created_at) return false;
                        const d = new Date(s.created_at);
                        return d.getFullYear() === selectedCalendarYear && d.getMonth() === mIdx;
                      });

                      const mHours = mSessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0);
                      const mCount = mSessions.length;
                      const mScore =
                        mSessions.length > 0
                          ? Math.round(
                              mSessions.reduce((acc, s) => acc + (s.flow_score || s.efficiency_score || 85), 0) /
                                mSessions.length
                            )
                          : 0;

                      return (
                        <div
                          key={monthName}
                          onClick={
                            isFutureMonth
                              ? undefined
                              : () => {
                                  setSelectedCalendarMonth(mIdx);
                                  setTimelineFilter("monthly");
                                }
                          }
                          className={`p-4 rounded-2xl border space-y-3 transition-all select-none ${
                            isFutureMonth
                              ? "bg-slate-200/60 text-slate-400 border-slate-300/40 cursor-not-allowed opacity-60"
                              : isCurrentMonth
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                : mHours > 0
                                  ? "bg-white/80 hover:bg-white text-slate-800 border-white/90 shadow-2xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                  : "bg-white/30 hover:bg-white/50 text-slate-400 border-white/40 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isFutureMonth ? "text-slate-400" : isCurrentMonth ? "text-white" : "text-slate-900"}`}>{monthName}</span>
                            <span className={`text-xs font-mono font-medium ${isFutureMonth ? "text-slate-400" : isCurrentMonth ? "text-cyan-200" : "text-slate-700"}`}>
                              {isFutureMonth ? "—" : `${mHours.toFixed(1)}h`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={isCurrentMonth ? "text-slate-300" : "text-slate-500"}>
                              {isFutureMonth ? "Upcoming" : `${mCount} ${mCount === 1 ? "Sprint" : "Sprints"}`}
                            </span>
                            <span className={isCurrentMonth ? "text-cyan-300 font-bold" : "text-slate-700 font-semibold"}>
                              {isFutureMonth ? "—" : mScore > 0 ? `${mScore}% Score` : "—"}
                            </span>
                          </div>

                          <div className={`h-1.5 rounded-full overflow-hidden ${isCurrentMonth ? "bg-slate-800" : "bg-slate-200/60"}`}>
                            <div
                              className={`h-full ${isCurrentMonth ? "bg-cyan-400" : "bg-slate-800"}`}
                              style={{ width: `${Math.min(100, Math.max(mHours > 0 ? 8 : 0, (mHours / 25) * 100))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 3. FLOATING BOTTOM DOCK: Always visible pinned navigation */}
      <DockNav activeTab="calendar" />

      {/* Session Details Modal */}
      {selectedSessionDetail && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSessionDetail(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-600 font-semibold block">Focus Session Log</span>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">{selectedSessionDetail.app_name}</h3>
              </div>
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                <span className="text-slate-400">Date</span>
                <span className="font-medium text-slate-800 text-right">
                  {selectedSessionDetail.created_at
                    ? new Date(selectedSessionDetail.created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                    : "Today"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                <span className="text-slate-400">Duration</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {selectedSessionDetail.duration_minutes} minutes
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                <span className="text-slate-400">Category</span>
                <span className="font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  {selectedSessionDetail.category}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600">
                <span className="text-slate-400 flex items-center">
                  <Sparkles className="w-3 h-3 text-cyan-600 mr-1" />
                  Flow State Score
                </span>
                <span className="font-mono font-semibold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-md border border-cyan-200">
                  {Math.round(selectedSessionDetail.flow_score || selectedSessionDetail.efficiency_score || 85)}% Optimal
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleDeleteSession(selectedSessionDetail.id);
                  setSelectedSessionDetail(null);
                }}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center space-x-1.5"
                title="Delete this focus session"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Session</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
