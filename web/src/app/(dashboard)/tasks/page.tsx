"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  Calendar,
  Clock,
  Target,
  CheckSquare,
  Zap,
  Trash2,
  Bell,
  User,
  LogOut,
  Grid,
  FileText,
  PieChart,
  Bookmark,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DockNav } from "@/components/navigation/DockNav";
import { TypewriterSessionLoader } from "@/components/loader/TypewriterSessionLoader";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  spentHours: number;
  targetHours: number;
  completed: boolean;
  scheduledDate?: string;
  startTime?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TasksPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "active" | "completed">("active");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");

  const [taskList, setTaskList] = useState<TaskItem[]>([
    { id: "t1", title: "Complete API telemetry endpoints", category: "Coding & Dev", spentHours: 1.8, targetHours: 2.5, completed: false, scheduledDate: new Date().toISOString().split("T")[0], startTime: "09:30" },
    { id: "t2", title: "Refine focus dial glassmorphism UI", category: "Design & UI", spentHours: 1.2, targetHours: 1.5, completed: false, scheduledDate: new Date().toISOString().split("T")[0], startTime: "14:00" },
    { id: "t3", title: "Draft performance benchmark memo", category: "Research & Docs", spentHours: 0.8, targetHours: 1.0, completed: true, scheduledDate: new Date().toISOString().split("T")[0], startTime: "16:30" },
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalCategory, setNewGoalCategory] = useState<string>("Coding & Dev");
  const [newGoalTargetHours, setNewGoalTargetHours] = useState<number>(0.4166);
  const [newGoalDate, setNewGoalDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newGoalStartTime, setNewGoalStartTime] = useState<string>("09:00");
  const [isInitialDataLoading, setIsInitialDataLoading] = useState<boolean>(true);

  // Header State
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch Tasks from API
  useEffect(() => {
    async function fetchTasks() {
      if (!token) {
        setIsInitialDataLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTaskList(
              data.map((t: any) => ({
                id: t.id,
                title: t.title,
                category: t.category,
                spentHours: t.spent_hours || 0,
                targetHours: t.target_hours || 1.0,
                completed: t.completed || false,
                scheduledDate: t.scheduled_date,
                startTime: t.start_time,
              }))
            );
          }
        }
      } catch {} finally {
        setIsInitialDataLoading(false);
      }
    }
    fetchTasks();
  }, [token]);

  const categories = [
    { id: "dev", name: "Coding & Dev", badgeColor: "bg-cyan-100/90 text-cyan-900 border-cyan-300/50", progressColor: "bg-cyan-600" },
    { id: "design", name: "Design & UI", badgeColor: "bg-indigo-100/90 text-indigo-950 border-indigo-300/50", progressColor: "bg-indigo-500" },
    { id: "research", name: "Research & Docs", badgeColor: "bg-slate-200/80 text-slate-700 border-slate-300/50", progressColor: "bg-slate-600" },
  ];

  const formatTimePrecise = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatTaskDateTime = (scheduledDate?: string, startTime?: string) => {
    if (!scheduledDate && !startTime) return "Today";
    const datePart = scheduledDate
      ? new Date(scheduledDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Today";
    const timePart = startTime || "";
    return timePart ? `${datePart} • ${timePart}` : datePart;
  };

  const [taskCompletionModal, setTaskCompletionModal] = useState<{ task: TaskItem; durationMinutes: number } | null>(null);
  // promptedTaskIds is now persisted in localStorage as "vita_prompted_task_ids"

  // Parse date and time strings accurately into ISO string
  const parseTaskDateAndTimeToIso = (dateStr?: string, timeStr?: string) => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    if (dateStr && dateStr !== "Today") {
      if (dateStr === "Tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        year = tomorrow.getFullYear();
        month = tomorrow.getMonth();
        day = tomorrow.getDate();
      } else if (dateStr.includes("-")) {
        const parts = dateStr.split("-").map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          year = parts[0];
          month = parts[1] - 1;
          day = parts[2];
        }
      } else if (dateStr.includes("/")) {
        const parts = dateStr.split("/").map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          day = parts[0];
          month = parts[1] - 1;
          year = parts[2];
        }
      }
    }

    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (timeStr && timeStr.includes(":")) {
      const parts = timeStr.split(":").map(Number);
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        hours = parts[0];
        minutes = parts[1];
      }
    }

    const d = new Date(year, month, day, hours, minutes, 0);
    return d.toISOString();
  };

  // Realtime Scheduled Tasks Clock Monitor:
  // Automatically pops up completion verification modal when target time from start time has elapsed in real time!
  useEffect(() => {
    const checkScheduledTasks = () => {
      if (taskCompletionModal) return;

      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = String(now.getMonth() + 1).padStart(2, "0");
      const todayDay = String(now.getDate()).padStart(2, "0");
      const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Load persisted prompted IDs from localStorage so they survive page navigations
      let persistedPrompted: Set<string>;
      try {
        const raw = localStorage.getItem("vita_prompted_task_ids");
        persistedPrompted = raw ? new Set(JSON.parse(raw)) : new Set();
      } catch {
        persistedPrompted = new Set();
      }

      for (const task of taskList) {
        if (task.completed) continue;
        if (persistedPrompted.has(String(task.id))) continue;

        const taskDateStr = task.scheduledDate ? task.scheduledDate.split("T")[0] : "";
        const isToday = !task.scheduledDate || task.scheduledDate === "Today" || taskDateStr === todayStr;
        if (!isToday) continue;

        if (task.startTime) {
          const timeParts = task.startTime.split(":");
          if (timeParts.length >= 2) {
            const startH = parseInt(timeParts[0], 10);
            const startM = parseInt(timeParts[1], 10);
            if (!isNaN(startH) && !isNaN(startM)) {
              const startMinutes = startH * 60 + startM;
              const durationMinutes = Math.max(1, Math.round((task.targetHours || 0.4166) * 60));
              const endMinutes = startMinutes + durationMinutes;

              if (currentMinutes >= endMinutes) {
                // Persist to localStorage so this task won't prompt again on next visit
                persistedPrompted.add(String(task.id));
                try {
                  localStorage.setItem("vita_prompted_task_ids", JSON.stringify([...persistedPrompted]));
                } catch {}

                setTaskCompletionModal({
                  task: task,
                  durationMinutes: durationMinutes,
                });

                if (typeof window !== "undefined") {
                  if ((window as any).electronAPI?.sendTimerCompletedNotification) {
                    (window as any).electronAPI.sendTimerCompletedNotification({
                      category: task.category,
                      durationMinutes: durationMinutes,
                    });
                  } else if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Scheduled Focus Time Finished! 🎯", {
                      body: `Your scheduled duration for "${task.title}" has finished. Did you complete this task?`,
                    });
                  }
                }
                break;
              }
            }
          }
        }
      }
    };

    checkScheduledTasks();
    const interval = setInterval(checkScheduledTasks, 3000);
    return () => clearInterval(interval);
  }, [taskList, taskCompletionModal]);


  const handleResolveTaskSprint = async (task: TaskItem, durationMinutes: number, wasCompleted: boolean) => {
    const addedHours = durationMinutes / 60;
    const newSpentHours = (task.spentHours || 0) + addedHours;

    // Update local state immediately
    setTaskList((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, spentHours: newSpentHours, completed: wasCompleted } : t))
    );
    setTaskCompletionModal(null);

    // Always persist the task ID so the modal won't re-fire on future page visits
    try {
      const raw = localStorage.getItem("vita_prompted_task_ids");
      const persisted: Set<string> = raw ? new Set(JSON.parse(raw)) : new Set();
      persisted.add(String(task.id));
      localStorage.setItem("vita_prompted_task_ids", JSON.stringify([...persisted]));
    } catch {}


    const sessionTimestamp = parseTaskDateAndTimeToIso(task.scheduledDate, task.startTime);

    let finalDurationMinutes = durationMinutes;
    if (wasCompleted && task.startTime) {
      const sessionIso = parseTaskDateAndTimeToIso(task.scheduledDate, task.startTime);
      const startDate = new Date(sessionIso);
      const now = new Date();
      const scheduledEndMs = startDate.getTime() + durationMinutes * 60000;
      if (!isNaN(startDate.getTime()) && now.getTime() > startDate.getTime() && now.getTime() < scheduledEndMs) {
        const elapsed = Math.round((now.getTime() - startDate.getTime()) / 60000);
        if (elapsed > 0 && elapsed < durationMinutes) {
          finalDurationMinutes = Math.max(1, elapsed);
        }
      }
    }

    if (token) {
      try {
        await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            spent_hours: newSpentHours,
            completed: wasCompleted ? true : false,
          }),
        });

        await fetch(`${API_BASE}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            duration_minutes: finalDurationMinutes,
            efficiency_score: wasCompleted ? 95 : 85,
            app_name: task.title || "Focus Session",
            category: task.category,
            created_at: sessionTimestamp,
          }),
        });
      } catch (err) {
        console.error("Failed to resolve task sprint", err);
      }
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    let createdTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      spentHours: 0,
      targetHours: newGoalTargetHours,
      completed: false,
      scheduledDate: newGoalDate,
      startTime: newGoalStartTime,
    };

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newGoalTitle.trim(),
            category: newGoalCategory,
            target_hours: newGoalTargetHours,
            scheduled_date: newGoalDate,
            start_time: newGoalStartTime,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          createdTask = {
            id: data.id,
            title: data.title,
            category: data.category || newGoalCategory,
            spentHours: data.spent_hours || 0,
            targetHours: data.target_hours || newGoalTargetHours,
            completed: data.completed || false,
            scheduledDate: data.scheduled_date || newGoalDate,
            startTime: data.start_time || newGoalStartTime,
          };
        }
      } catch (err) {
        console.error("Failed to save task to backend", err);
      }
    }

    setTaskList((prev) => [createdTask, ...prev]);
    setNewGoalTitle("");
  };

  const toggleTask = async (taskId: string) => {
    const target = taskList.find((t) => t.id === taskId);
    if (!target) return;

    const nextCompleted = !target.completed;
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );

    if (token) {
      try {
        await fetch(`${API_BASE}/tasks/${target.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: nextCompleted }),
        });

        if (nextCompleted) {
          const sessionTimestamp = parseTaskDateAndTimeToIso(target.scheduledDate, target.startTime);
          const startDate = new Date(sessionTimestamp);
          const now = new Date();
          const targetMinutes = Math.max(1, Math.round((target.targetHours || 0.4166) * 60));

          let durMinutes = targetMinutes;
          if (!isNaN(startDate.getTime()) && now.getTime() > startDate.getTime()) {
            const elapsed = Math.round((now.getTime() - startDate.getTime()) / 60000);
            if (elapsed > 0 && elapsed < targetMinutes) {
              durMinutes = Math.max(1, elapsed);
            }
          }

          await fetch(`${API_BASE}/sessions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              duration_minutes: durMinutes,
              efficiency_score: 95,
              app_name: target.title || "Focus Session",
              category: target.category,
              created_at: sessionTimestamp,
            }),
          });
        }
      } catch (err) {
        console.error("Failed to update task completion", err);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskList((prev) => prev.filter((t) => t.id !== taskId));
  };

  const filteredTasks = taskList.filter((task) => {
    if (taskStatusFilter === "active" && task.completed) return false;
    if (taskStatusFilter === "completed" && !task.completed) return false;
    if (taskCategoryFilter !== "all") {
      const matches =
        task.category === taskCategoryFilter ||
        (task.category.toLowerCase().includes("engineer") && taskCategoryFilter.toLowerCase().includes("coding"));
      if (!matches) return false;
    }
    return true;
  });

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

        {/* Center Header Column: Integrated Task Status Selector Pills */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-2xs">
            {(["all", "active", "completed"] as const).map((tab) => {
              const count =
                tab === "all"
                  ? taskList.length
                  : tab === "active"
                  ? taskList.filter((t) => !t.completed).length
                  : taskList.filter((t) => t.completed).length;
              const isActive = taskStatusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTaskStatusFilter(tab)}
                  className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer capitalize ${
                    isActive ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
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

      {/* 2. MAIN VIEWPORT: Exact Original Tasks View */}
      <div className="max-w-6xl w-full mx-auto h-full flex flex-col min-h-0 space-y-4 p-2 sm:p-4 pb-20 animate-page-entrance overflow-hidden">
        {/* Top Banner Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/70 shadow-xs shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Focus Goals & Milestones</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage sprint goals allocated to your primary focus disciplines</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-800 bg-white/80 px-3 py-1.5 rounded-full border border-white shadow-2xs font-semibold">
              {taskList.filter((t) => t.completed).length} / {taskList.length} Goals Completed
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Form + Task List */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-h-0 space-y-3 overflow-hidden">
            {/* Form to Add Goal */}
            <form onSubmit={handleAddGoal} className="bg-white/70 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/80 shadow-xs space-y-2.5 shrink-0">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Enter task or focus goal (e.g. Gym workout, Review React PR, Send invoice)..."
                  className="flex-1 px-4 py-2.5 text-xs bg-white/90 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!newGoalTitle.trim()}
                  className="px-5 py-2.5 bg-[#181a1b] text-white text-xs font-medium rounded-2xl hover:bg-slate-900 disabled:opacity-40 transition shadow-xs cursor-pointer flex items-center space-x-1.5 shrink-0"
                  title="Add New Goal or Task to Queue"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* 3-Block Grid Meta Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2.5 border-t border-slate-200/60 text-xs">
                <div className="sm:col-span-4 lg:col-span-3 flex items-center justify-between bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs relative transition">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Category:</span>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => { e.stopPropagation(); setNewGoalCategory(e.target.value); }}
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium appearance-none pl-2 pr-5 truncate select-auto pointer-events-auto"
                  >
                    <optgroup label="Focus Disciplines">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Personal & Routine">
                      <option value="Personal & Health">Personal & Health</option>
                      <option value="Admin & Routine">Admin & Routine</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 shrink-0" />
                </div>

                <div className="sm:col-span-4 lg:col-span-4 flex items-center bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      value={newGoalDate}
                      onChange={(e) => setNewGoalDate(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-mono font-medium [&::-webkit-calendar-picker-indicator]:hidden w-24 [color-scheme:light]"
                      title="Scheduled Date"
                    />
                    <span className="text-slate-300 text-xs font-mono">|</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="time"
                      value={newGoalStartTime}
                      onChange={(e) => setNewGoalStartTime(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-mono font-medium [&::-webkit-calendar-picker-indicator]:hidden w-14 [color-scheme:light]"
                      title="Task Starting Time"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4 lg:col-span-5 flex items-center justify-between bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition">
                  <div className="flex items-center space-x-1.5 shrink-0 mr-1">
                    <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-400 font-medium">Target:</span>
                  </div>
                  <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                    {[
                      { label: "15m", val: 15 / 60 },
                      { label: "25m", val: 25 / 60 },
                      { label: "45m", val: 45 / 60 },
                      { label: "1h", val: 1.0 },
                      { label: "2h", val: 2.0 },
                    ].map((p) => {
                      const isSelected = Math.abs(newGoalTargetHours - p.val) < 0.01;
                      return (
                        <button
                          type="button"
                          key={p.label}
                          onClick={() => setNewGoalTargetHours(p.val)}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono transition cursor-pointer shrink-0 ${
                            isSelected ? "bg-slate-900 text-white font-semibold shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}

                    <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max="720"
                        step="1"
                        value={Math.round(newGoalTargetHours * 60)}
                        onChange={(e) => setNewGoalTargetHours(Math.max(1, parseInt(e.target.value) || 1) / 60)}
                        className="w-10 px-1 py-0.5 text-[10px] font-mono text-slate-800 bg-white border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-slate-800 shadow-2xs"
                        title="Custom Target Duration"
                      />
                      <span className="text-[10px] font-mono text-slate-400">m</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Quick-Filter Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 shrink-0 no-scrollbar">
              <button
                onClick={() => setTaskCategoryFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                  taskCategoryFilter === "all" ? "bg-slate-800 text-white shadow-2xs" : "bg-white/60 text-slate-600 hover:bg-white border border-white"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const isCatActive = taskCategoryFilter === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setTaskCategoryFilter(isCatActive ? "all" : cat.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${
                      isCatActive ? "bg-slate-900 text-white border-slate-900 shadow-2xs" : "bg-white/60 text-slate-700 border-white hover:bg-white"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {["Personal & Health", "Admin & Routine"].map((pCat) => {
                const isCatActive = taskCategoryFilter === pCat;
                return (
                  <button
                    key={pCat}
                    onClick={() => setTaskCategoryFilter(isCatActive ? "all" : pCat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${
                      isCatActive ? "bg-slate-900 text-white border-slate-900 shadow-2xs" : "bg-white/60 text-slate-700 border-white hover:bg-white"
                    }`}
                  >
                    {pCat}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Task List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar pb-4">
              {filteredTasks.length === 0 ? (
                <div className="bg-white/50 p-8 rounded-3xl border border-white/60 text-center space-y-1">
                  <p className="text-xs text-slate-600 font-medium">No tasks found for this filter.</p>
                  <p className="text-[11px] text-slate-400">Add a new goal or activity above to start tracking progress.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const matchedCat = categories.find(
                    (c) =>
                      c.name === task.category ||
                      (task.category.toLowerCase().includes("engineer") && c.name.toLowerCase().includes("coding"))
                  );
                  const isPersonal =
                    task.category.toLowerCase().includes("health") ||
                    task.category.toLowerCase().includes("gym") ||
                    task.category.toLowerCase().includes("personal");
                  const isAdmin =
                    task.category.toLowerCase().includes("admin") ||
                    task.category.toLowerCase().includes("routine") ||
                    task.category.toLowerCase().includes("mail");

                  const badgeStyle = isPersonal
                    ? "bg-rose-100 text-rose-950 border-rose-200"
                    : isAdmin
                      ? "bg-teal-100 text-teal-950 border-teal-200"
                      : matchedCat?.badgeColor || "bg-slate-100 text-slate-700 border-slate-200";

                  const progressColor = isPersonal
                    ? "bg-rose-500"
                    : isAdmin
                      ? "bg-teal-600"
                      : matchedCat?.progressColor || "bg-cyan-600";

                  const progressPct = task.completed
                    ? 100
                    : Math.min(95, Math.round(((task.spentHours || 0) / (task.targetHours || 0.4166)) * 100));

                  return (
                    <div
                      key={task.id}
                      className={`bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs flex items-center justify-between transition-all hover:bg-white ${
                        task.completed ? "opacity-60 bg-white/40" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 mr-3 min-w-0">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition cursor-pointer shrink-0 ${
                            task.completed
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-slate-500"
                          }`}
                          title={task.completed ? "Mark Task as Incomplete" : "Mark Task as Completed"}
                        >
                          <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold text-slate-900 truncate ${task.completed ? "line-through text-slate-500" : ""}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5 flex-wrap gap-y-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${badgeStyle}`}>
                              {task.category}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono flex items-center">
                              <Calendar className="w-2.5 h-2.5 text-slate-400 inline mr-1" />
                              <span>{formatTaskDateTime(task.scheduledDate, task.startTime)}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatTimePrecise(task.spentHours)} / {formatTimePrecise(task.targetHours || 0.4166)} Target
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="w-16 sm:w-20 hidden sm:block">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-0.5">
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {!task.completed && !isPersonal && !isAdmin && (
                          <button
                            onClick={() => router.push("/dashboard")}
                            className="px-2.5 py-1 text-[11px] font-medium text-cyan-900 bg-cyan-100 hover:bg-cyan-200 rounded-xl border border-cyan-300 transition cursor-pointer hidden md:flex items-center space-x-1"
                            title="Launch Focus Dial for this task"
                          >
                            <Zap className="w-3 h-3 text-cyan-700" />
                            <span>Focus</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Goal Allocations & Progress Summary */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-0 overflow-hidden">
            <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xs flex flex-col min-h-0 max-h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-2 shrink-0">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Allocations</h3>
                  <p className="text-[10px] text-slate-500">
                    {taskList.filter((t) => t.completed).length} of {taskList.length} done (
                    {taskList.length > 0 ? Math.round((taskList.filter((t) => t.completed).length / taskList.length) * 100) : 0}%)
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs font-semibold">
                  {taskList.length} Tasks
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 custom-scrollbar pb-1">
                {[
                  ...categories,
                  { id: "personal_health", name: "Personal & Health", progressColor: "bg-rose-500", badgeColor: "bg-rose-100 text-rose-950 border-rose-200" },
                  { id: "admin_routine", name: "Admin & Routine", progressColor: "bg-teal-600", badgeColor: "bg-teal-100 text-teal-950 border-teal-200" },
                ].map((cat) => {
                  const catTasks = taskList.filter((t) => {
                    if (cat.name === "Personal & Health") {
                      return t.category.toLowerCase().includes("health") || t.category.toLowerCase().includes("gym") || t.category.toLowerCase().includes("personal");
                    }
                    if (cat.name === "Admin & Routine") {
                      return t.category.toLowerCase().includes("admin") || t.category.toLowerCase().includes("routine") || t.category.toLowerCase().includes("mail");
                    }
                    return t.category === cat.name || (t.category.toLowerCase().includes("engineer") && cat.name.toLowerCase().includes("coding"));
                  });

                  const completedCatTasks = catTasks.filter((t) => t.completed).length;
                  const totalPlannedHours = catTasks.reduce((acc, t) => acc + (t.targetHours || 0.4166), 0);
                  const progressPct = catTasks.length > 0 ? Math.round((completedCatTasks / catTasks.length) * 100) : 0;

                  return (
                    <div
                      key={cat.id}
                      className="px-2.5 py-1.5 bg-white/50 hover:bg-white/80 rounded-xl border border-white/70 shadow-2xs space-y-0.5 transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.progressColor}`} />
                          <span className="text-slate-800 font-medium truncate text-[11px]">{cat.name}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[9px] shrink-0 pl-1">
                          {completedCatTasks}/{catTasks.length} {catTasks.length > 0 ? `(${formatTimePrecise(totalPlannedHours)})` : ""}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.progressColor} rounded-full transition-all duration-500`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
                <span>Velocity:</span>
                <span className="font-semibold text-slate-800">
                  {taskList.length > 0 ? `${Math.round((taskList.filter((t) => t.completed).length / taskList.length) * 100)}% Complete` : "0% Complete"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {taskCompletionModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Focus Time Completed</h3>
                  <p className="text-xs text-slate-500">Scheduled {taskCompletionModal.durationMinutes}m sprint finished</p>
                </div>
              </div>
              <button
                onClick={() => setTaskCompletionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Details Card */}
            {(() => {
              const isPersonal =
                taskCompletionModal.task.category.toLowerCase().includes("health") ||
                taskCompletionModal.task.category.toLowerCase().includes("gym") ||
                taskCompletionModal.task.category.toLowerCase().includes("personal");
              const isAdmin =
                taskCompletionModal.task.category.toLowerCase().includes("admin") ||
                taskCompletionModal.task.category.toLowerCase().includes("routine") ||
                taskCompletionModal.task.category.toLowerCase().includes("mail");
              const matchedCat = categories.find(
                (c) =>
                  c.name === taskCompletionModal.task.category ||
                  (taskCompletionModal.task.category.toLowerCase().includes("engineer") && c.name.toLowerCase().includes("coding"))
              );

              const badgeStyle = isPersonal
                ? "bg-rose-100 text-rose-950 border-rose-200"
                : isAdmin
                ? "bg-teal-100 text-teal-950 border-teal-200"
                : matchedCat?.badgeColor || "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${badgeStyle}`}>
                      {taskCompletionModal.task.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{taskCompletionModal.durationMinutes} min</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{taskCompletionModal.task.title}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-200/60">
                    <span>
                      {taskCompletionModal.task.scheduledDate || "Today"}
                      {taskCompletionModal.task.startTime ? ` • ${taskCompletionModal.task.startTime}` : ""}
                    </span>
                    <span className="text-slate-600 font-sans font-medium">Adds to Calendar</span>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-600">Did you finish this task, or are you still working on it?</p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleResolveTaskSprint(taskCompletionModal.task, taskCompletionModal.durationMinutes, false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Still Working
              </button>
              <button
                type="button"
                onClick={() => handleResolveTaskSprint(taskCompletionModal.task, taskCompletionModal.durationMinutes, true)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs text-center"
              >
                Yes, Completed!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. FLOATING BOTTOM DOCK: Always visible pinned navigation */}
      <DockNav activeTab="tasks" />
    </div>
  );
}
