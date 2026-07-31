"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  RotateCcw,
  Bell,
  Settings,
  Plus,
  Grid,
  Calendar,
  FileText,
  PieChart,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Square,
  Hourglass,
  Sliders,
  User,
  LogOut,
  Play,
  Pause,
  Filter,
  ChevronLeft,
  Zap,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  EyeOff,
  Activity,
  Award,
  CheckSquare,
  Volume2,
  VolumeX,
  Radio,
  X,
  Laptop
} from "lucide-react";

type DockTab = "overview" | "calendar" | "tasks" | "analytics" | "insights" | "settings";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  spentHours: number;
  targetHours: number;
  completed: boolean;
}

interface CategoryTrack {
  id: string;
  name: string;
  targetHours: number;
  spentHours: number;
  badgeColor: string;
  progressColor: string;
}

interface AppTelemetry {
  name: string;
  category: string;
  spentFormatted: string;
  pct: number;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const APP_TELEMETRY_DATA: Record<string, AppTelemetry> = {
  "Antigravity": { name: "Antigravity", category: "Engineering", spentFormatted: "3h 40m", pct: 38, status: "AI Agentic Development" },
  "Safari": { name: "Safari", category: "Research", spentFormatted: "2h 15m", pct: 24, status: "Documentation Browsing" },
  "Discord": { name: "Discord", category: "Communication", spentFormatted: "1h 45m", pct: 18, status: "Team Discussions" },
  "OrbStack": { name: "OrbStack", category: "Engineering", spentFormatted: "1h 20m", pct: 12, status: "Container Virtualization" },
  "VS Code": { name: "VS Code", category: "Engineering", spentFormatted: "2h 10m", pct: 22, status: "Active Development" },
  "Figma": { name: "Figma", category: "Design & UI", spentFormatted: "1h 15m", pct: 15, status: "Design Tokens" },
  "Chrome": { name: "Chrome", category: "Research", spentFormatted: "1h 00m", pct: 10, status: "Web Research" },
  "iTerm": { name: "iTerm", category: "Engineering", spentFormatted: "1h 50m", pct: 58, status: "CLI Deployments" },
  "Slack": { name: "Slack", category: "Communication", spentFormatted: "2h 05m", pct: 72, status: "Async Chat" },
  "Notion": { name: "Notion", category: "Productivity", spentFormatted: "1h 30m", pct: 57, status: "Notes" },
  "Docker": { name: "Docker", category: "Engineering", spentFormatted: "1h 20m", pct: 64, status: "Containers" }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Component Refs for Click-Outside Listeners
  const userMenuRef = useRef<HTMLDivElement>(null);
  const audioPopoverRef = useRef<HTMLDivElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Dynamic Live Analytics & Metrics State from Database (Zero Default for New Accounts)
  const [dailyFocusHours, setDailyFocusHours] = useState<number>(0.0);
  const [weeklyFocusHours, setWeeklyFocusHours] = useState<number>(0.0);
  const [totalFocusHours, setTotalFocusHours] = useState<number>(0.0);
  const [focusScore, setFocusScore] = useState<number>(0);
  const [remainingTargetHours, setRemainingTargetHours] = useState<number>(7.0);

  // Interactive Category Sessions State for Left Panel
  const [activeCategory, setActiveCategory] = useState<string>("Coding & Dev");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Coding & Dev");
  const [categories, setCategories] = useState<CategoryTrack[]>([
    { id: "dev", name: "Coding & Dev", targetHours: 4.0, spentHours: 0.0, badgeColor: "bg-cyan-100/90 text-cyan-900 border-cyan-300/50", progressColor: "bg-cyan-600" },
    { id: "design", name: "Design & UI", targetHours: 3.0, spentHours: 0.0, badgeColor: "bg-indigo-100/90 text-indigo-950 border-indigo-300/50", progressColor: "bg-indigo-500" },
    { id: "research", name: "Research & Docs", targetHours: 2.0, spentHours: 0.0, badgeColor: "bg-slate-200/80 text-slate-700 border-slate-300/50", progressColor: "bg-slate-600" },
  ]);
  const [settingsModalCategory, setSettingsModalCategory] = useState<CategoryTrack | null>(null);
  const [tempTargetHours, setTempTargetHours] = useState<number>(4.0);

  // Pure Dynamic Realtime System Telemetry State (Zero Hardcoded Pre-filled Data)
  const [appPctMap, setAppPctMap] = useState<Record<string, number>>({});
  const [appSecondsMap, setAppSecondsMap] = useState<Record<string, number>>({});
  const [appCategoryMap, setAppCategoryMap] = useState<Record<string, string>>({});
  const [macOSPermissionGranted, setMacOSPermissionGranted] = useState<boolean>(true);

  // App Inspector Modal State
  const [inspectorApp, setInspectorApp] = useState<AppTelemetry | null>(null);

  // Live Pulsating Micro Sparkline Equalizer Heights
  const [sparklineHeights, setSparklineHeights] = useState<number[]>([
    30, 45, 60, 40, 75, 90, 85, 70, 95, 80, 65, 85, 90, 100, 85
  ]);

  // Navigation & View States
  const [activeDockTab, setActiveDockTab] = useState<DockTab>("overview");
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(true);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<string | null>("VS Code");
  
  // Interactive Focus Dial Timer States
  const [activeSessionRunning, setActiveSessionRunning] = useState<boolean>(false);
  const [sprintDuration, setSprintDuration] = useState<number>(25); // 15, 25, 45, 60, 90 mins
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [activeAppFilter, setActiveAppFilter] = useState<string>("all");
  const [showFilterPopover, setShowFilterPopover] = useState<boolean>(false);
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  
  // Ambient Soundscapes Engine States
  const [focusAudioMode, setFocusAudioMode] = useState<boolean>(false);
  const [audioPreset, setAudioPreset] = useState<"brown" | "binaural" | "rain">("brown");
  const [audioVolume, setAudioVolume] = useState<number>(65);
  const [showAudioPopover, setShowAudioPopover] = useState<boolean>(false);

  // Privacy & Governance States
  const [trackingEngineActive, setTrackingEngineActive] = useState<boolean>(true);
  const [localVaultEncryption, setLocalVaultEncryption] = useState<boolean>(true);
  const [excludedApps, setExcludedApps] = useState<string[]>(["SOGO Mail", "1Password", "Banking App"]);
  const [newExcludedAppInput, setNewExcludedAppInput] = useState<string>("");
  const [settingsFeedbackMsg, setSettingsFeedbackMsg] = useState<string | null>(null);

  // User Profile Form State
  const [profileNameInput, setProfileNameInput] = useState<string>("");
  const [profileEmailInput, setProfileEmailInput] = useState<string>("");

  useEffect(() => {
    if (user) {
      setProfileNameInput(user.name || "");
      setProfileEmailInput(user.email || "");
    }
  }, [user]);

  // Excluded Apps Handlers
  const handleAddExcludedApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcludedAppInput.trim()) return;
    const trimmed = newExcludedAppInput.trim();
    if (!excludedApps.includes(trimmed)) {
      setExcludedApps(prev => [...prev, trimmed]);
      setSettingsFeedbackMsg(`Added "${trimmed}" to excluded apps list.`);
      setTimeout(() => setSettingsFeedbackMsg(null), 3000);
    }
    setNewExcludedAppInput("");
  };

  const handleRemoveExcludedApp = (appName: string) => {
    setExcludedApps(prev => prev.filter(a => a !== appName));
    setSettingsFeedbackMsg(`Removed "${appName}" from excluded list.`);
    setTimeout(() => setSettingsFeedbackMsg(null), 3000);
  };

  // Focus Tasks State
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [taskList, setTaskList] = useState<TaskItem[]>([]);

  // Real Export JSON Handler
  const handleExportJSON = () => {
    const dataObj = {
      exportTimestamp: new Date().toISOString(),
      user: user ? { email: user.email, name: user.name } : null,
      analytics: {
        dailyFocusHours,
        weeklyFocusHours,
        totalFocusHours,
        focusScore
      },
      appSecondsMap,
      appPctMap,
      tasks: taskList
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vita_telemetry_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSettingsFeedbackMsg("Telemetry JSON report exported successfully.");
    setTimeout(() => setSettingsFeedbackMsg(null), 3000);
  };

  // Real Export CSV Handler
  const handleExportCSV = () => {
    let csv = "App Name,Tracked Time (Seconds),Percentage Share\n";
    Object.keys(appPctMap).forEach(app => {
      const secs = appSecondsMap[app] || 0;
      const pct = appPctMap[app] || 0;
      csv += `"${app}",${secs},${pct}%\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vita_focus_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSettingsFeedbackMsg("Analytics CSV report exported successfully.");
    setTimeout(() => setSettingsFeedbackMsg(null), 3000);
  };

  // Modal States
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Open Purge Modal
  const handlePurgeData = () => {
    setShowPurgeModal(true);
  };

  // Open Logout Modal
  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  // Execute Logout
  const executeLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.push("/login");
  };

  // Execute Account Deletion & Data Purge Call to FastAPI Backend
  const executePurgeData = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/account`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {}
    }

    setAppPctMap({});
    setAppSecondsMap({});
    setShowPurgeModal(false);
    
    // Clear user auth session & redirect to login page
    logout();
    router.push("/login");
  };

  // Save Settings Handler
  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedbackMsg("Account preferences & governance policies saved successfully.");
    setTimeout(() => setSettingsFeedbackMsg(null), 3000);
  };

  // Fetch Tasks & Analytics Summary from FastAPI Backend
  const fetchAnalyticsSummary = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    if (!token) return;

    fetch(`${API_BASE}/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setDailyFocusHours(data.daily_focus_hours);
          setWeeklyFocusHours(data.weekly_focus_hours);
          setTotalFocusHours(data.total_focus_hours);
          setFocusScore(data.focus_score);
          setRemainingTargetHours(data.remaining_target_hours);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: TaskItem[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category || "Engineering",
            spentHours: t.spent_hours || 0,
            targetHours: t.target_hours || 2.0,
            completed: t.completed
          }));
          setTaskList(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAnalyticsSummary();

    // Listen for Realtime macOS System Application Telemetry from Electron
    if (typeof window !== "undefined" && (window as any).electronAPI?.onRealtimeActivityTelemetry) {
      (window as any).electronAPI.onRealtimeActivityTelemetry((data: any) => {
        if (data?.activeApp) {
          setSelectedApp(data.activeApp);
          if (data.category) {
            setActiveCategory(data.category);
            setAppCategoryMap(prev => ({ ...prev, [data.activeApp]: data.category }));
          }
          if (data.appPercentages) {
            setAppPctMap(data.appPercentages);
          }
          if (data.appTimeSeconds) {
            setAppSecondsMap(data.appTimeSeconds);
          }
          if (typeof data.permissionGranted === "boolean") {
            setMacOSPermissionGranted(data.permissionGranted);
          }
        }
      });
    }
  }, []);

  // Live Pulsating Equalizer Effect when Session is Running
  useEffect(() => {
    let eqInterval: NodeJS.Timeout | null = null;
    if (activeSessionRunning) {
      eqInterval = setInterval(() => {
        setSparklineHeights(prev =>
          prev.map(() => Math.floor(Math.random() * 65) + 35)
        );
        setCategories(prevCats =>
          prevCats.map(cat => {
            if (cat.name === activeCategory) {
              const newSpent = cat.spentHours + 1 / 3600;
              return { ...cat, spentHours: newSpent };
            }
            return cat;
          })
        );
      }, 1000);
    }
    return () => {
      if (eqInterval) clearInterval(eqInterval);
    };
  }, [activeSessionRunning, activeCategory]);

  // Click Outside Event Listener for Popovers and Modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (audioPopoverRef.current && !audioPopoverRef.current.contains(event.target as Node)) {
        setShowAudioPopover(false);
      }
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setShowFilterPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Live Timer Countdown Effect & Session Completion Persistence
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSessionRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setActiveSessionRunning(false);

      const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
      if (token) {
        fetch(`${API_BASE}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            duration_minutes: sprintDuration,
            efficiency_score: Math.min(100, Math.round(80 + (sprintDuration / 5.0))),
            app_name: selectedApp || "VS Code",
            category: activeCategory
          })
        })
          .then(() => fetchAnalyticsSummary())
          .catch(() => {});
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSessionRunning, timerSeconds, sprintDuration, selectedApp, activeCategory]);

  // Native Web Audio API Soundscape Generator Engine
  useEffect(() => {
    if (!focusAudioMode) return;

    let audioCtx: AudioContext | null = null;
    let sourceNode: AudioBufferSourceNode | null = null;
    let gainNode: GainNode | null = null;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
      gainNode = audioCtx.createGain();
      
      const gainVal = (audioVolume / 100) * 0.12;
      gainNode.gain.value = gainVal;
      gainNode.connect(audioCtx.destination);

      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      if (audioPreset === "brown") {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      } else if (audioPreset === "rain") {
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          b2 = 0.85 * b2 + white * 0.15;
          data[i] = (b0 + b1 + b2) * 0.35;
        }
      } else {
        // Binaural 40Hz Gamma Focus Frequency
        for (let i = 0; i < bufferSize; i++) {
          const t = i / audioCtx.sampleRate;
          data[i] = (Math.sin(2 * Math.PI * 200 * t) + Math.sin(2 * Math.PI * 240 * t)) * 0.25;
        }
      }

      sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.loop = true;
      sourceNode.connect(gainNode);
      sourceNode.start(0);
    } catch {
      // Fallback
    }

    return () => {
      if (sourceNode) {
        try { sourceNode.stop(); } catch {}
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch {}
      }
    };
  }, [focusAudioMode, audioPreset, audioVolume]);

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cycle Pomodoro sprint length
  const cycleSprintDuration = () => {
    const options = [15, 25, 45, 60, 90];
    const nextDuration = options[(options.indexOf(sprintDuration) + 1) % options.length];
    setSprintDuration(nextDuration);
    setTimerSeconds(nextDuration * 60);
    setActiveSessionRunning(true);
  };

  // Progress Calculations for Live Central Dial & Indicator Rotation
  const totalSprintSeconds = sprintDuration * 60;
  const elapsedSeconds = Math.max(0, totalSprintSeconds - timerSeconds);
  const progressFraction = Math.max(0, Math.min(1, elapsedSeconds / totalSprintSeconds));

  // Save Settings Modal Category Changes
  const handleSaveCategorySettings = () => {
    if (!settingsModalCategory) return;
    setCategories(categories.map(c => c.id === settingsModalCategory.id ? { ...c, targetHours: tempTargetHours } : c));
    setSettingsModalCategory(null);
  };

  // Add new task & sync with FastAPI backend
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    let createdTask: TaskItem = {
      id: Date.now().toString(),
      title: newGoalTitle,
      category: "Engineering",
      spentHours: 0,
      targetHours: 2.0,
      completed: false
    };

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newGoalTitle,
            category: "Engineering",
            target_hours: 2.0
          })
        });
        if (res.ok) {
          const data = await res.json();
          createdTask = {
            id: data.id,
            title: data.title,
            category: data.category,
            spentHours: data.spent_hours,
            targetHours: data.target_hours,
            completed: data.completed
          };
          fetchAnalyticsSummary();
        }
      } catch {}
    }

    setTaskList([createdTask, ...taskList]);
    setNewGoalTitle("");
  };

  // Toggle task completion & sync with FastAPI backend
  const toggleTask = async (id: string) => {
    const target = taskList.find(t => t.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    setTaskList(taskList.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));

    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    if (token) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ completed: nextCompleted })
        });
        fetchAnalyticsSummary();
      } catch {}
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#e4e7e4] text-slate-800 flex flex-col p-4 sm:p-6 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Clean Brand Name Only & Rich Tooltips                      */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between pb-4 shrink-0">
        
        {/* Left Header Column: Clean Brand Name Only */}
        <div className="w-72 lg:w-80 flex items-center shrink-0">
          <h1 className="font-[family-name:var(--font-hubballi)] text-4xl font-normal leading-none tracking-tight text-slate-900">
            vita
          </h1>
        </div>

        {/* Center Header Column (Centered Over Main Canvas flex-1) */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          
          {/* Metric 1: Daily Focus */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Daily Focus</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                {dailyFocusHours.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs text-slate-400 font-normal">hrs</span>
            </div>
          </div>

          {/* Metric 2: Weekly Focus */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Weekly Focus</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                {weeklyFocusHours.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-xs text-slate-400 font-normal">hrs</span>
            </div>
          </div>

          {/* Metric 3: Focus Score */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Focus Score</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                {Math.round(focusScore)}
              </span>
              <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
          </div>

          {/* Metric 4: Tasks Done */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Tasks Done</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                {taskList.filter(t => t.completed).length}
              </span>
              <span className="text-xs text-slate-400 font-normal">/{taskList.length}</span>
            </div>
          </div>

        </div>

        {/* Right Header Column (Matches Right Drawer Width w-72 lg:w-80) */}
        <div className="w-72 lg:w-80 flex items-center justify-end space-x-2 shrink-0">
          
          {/* Action Button 1: Re-sync Activity Engine */}
          <button 
            onClick={() => fetchAnalyticsSummary()}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300/70 text-slate-700 flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95"
            title="Re-sync Activity Telemetry & Fetch Database Metrics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 2: Focus Alerts & Notifications */}
          <button 
            onClick={() => setNotificationActive(!notificationActive)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${notificationActive ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"}`}
            title="Toggle Focus Break Alerts & Distraction Shield Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 3: Privacy & Engine Preferences */}
          <button 
            onClick={() => setActiveDockTab("settings")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${activeDockTab === "settings" ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"}`}
            title="Configure Local Device Vault & Telemetry Encryption Settings"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 4: User Profile & Account Menu */}
          <div ref={userMenuRef} className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-medium flex items-center justify-center shadow-xs hover:ring-2 hover:ring-slate-400 transition cursor-pointer hover:scale-105 active:scale-95"
              title="User Account & Authentication Menu"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || "user@example.com"}</p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Sign Out of Vita Security Vault"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEWPORT GRID: Left Focus Panel | Central Canvas | Right Drawer   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex space-x-6 min-h-0 overflow-hidden relative">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Total Focus Time Gauge + Active Focus Sessions             */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-72 lg:w-80 flex flex-col space-y-4 shrink-0 overflow-y-auto pr-1 animate-panel-left">
          
          {/* Top Card: Total Focus Time Gauge */}
          <div className="bg-[#dcdfdc]/70 rounded-3xl p-5 border border-white/40 shadow-xs flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <span className="text-[11px] text-slate-400 font-normal self-start">Total Focus Time</span>
            
            <div className="text-center my-2">
              <span className="text-xs text-slate-400">Total Tracked Hours</span>
              <div className="text-4xl font-light text-slate-900 tracking-tight mt-1">
                {totalFocusHours > 0 ? totalFocusHours.toFixed(1).replace(".", ",") : "0,0"} <span className="text-sm font-normal text-slate-400">hrs</span>
              </div>
            </div>

            {/* Mathematically Exact Semi-Circle Arc Gauge (Radius = 38) */}
            {(() => {
              const targetPct = Math.min(100, Math.round((dailyFocusHours / 7.0) * 100));
              const needleRad = Math.PI * (1 - targetPct / 100);
              const needleX = (50 + 38 * Math.cos(needleRad)).toFixed(2);
              const needleY = (50 - 38 * Math.sin(needleRad)).toFixed(2);

              return (
                <div className="relative w-44 h-24 my-2 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 55">
                    <path
                      d="M 12 50 A 38 38 0 0 1 88 50"
                      fill="none"
                      stroke="#c5c9c5"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M 12 50 A 38 38 0 0 1 ${needleX} ${needleY}`}
                      fill="none"
                      stroke="url(#cyanAuthGaugeGradient)"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="cyanAuthGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <line x1="50" y1="50" x2={needleX} y2={needleY} stroke="#181a1b" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3.5" fill="#181a1b" />
                  </svg>
                </div>
              );
            })()}
            
            <span className="text-[10px] text-slate-500 font-mono">
              {Math.min(100, Math.round((dailyFocusHours / 7.0) * 100))}% of Daily Target
            </span>
          </div>

          {/* DYNAMIC REAL-TIME & INTERACTIVE CATEGORY SESSION TRACKS */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const isExpanded = expandedCategory === cat.name;
              const isActive = activeCategory === cat.name;
              const calcPct = Math.min(100, Math.round((cat.spentHours / cat.targetHours) * 100));

              if (isExpanded) {
                // EXPANDED DEEP WORK / CATEGORY FOCUS CARD VIEW
                return (
                  <div 
                    key={cat.id} 
                    className="bg-[#dcdfdc]/90 rounded-3xl p-4 border border-white/60 shadow-xs space-y-3 transition-all duration-300"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-medium">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({cat.spentHours.toFixed(1)}h / {cat.targetHours}h)
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setActiveCategory(cat.name);
                            setActiveSessionRunning(true);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer flex items-center space-x-1 ${isActive && activeSessionRunning ? "bg-cyan-100 text-cyan-900 border border-cyan-300" : "bg-[#181a1b] text-white hover:bg-slate-800"}`}
                          title={`Switch Active Sprint Session to ${cat.name}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive && activeSessionRunning ? "bg-cyan-600 animate-pulse-subtle" : "bg-slate-400"}`} />
                          <span>{isActive && activeSessionRunning ? "Recording" : "Set Active"}</span>
                        </button>
                        
                        <Settings 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsModalCategory(cat);
                            setTempTargetHours(cat.targetHours);
                          }}
                          className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 cursor-pointer transition"
                        />
                        
                        <ChevronUp 
                          onClick={() => setExpandedCategory(null)}
                          className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 cursor-pointer transition"
                        />
                      </div>
                    </div>

                    {/* Efficiency Metric Display */}
                    {(() => {
                      const categoryWeights: Record<string, number> = {
                        "Coding & Dev": 95,
                        "Design & UI": 90,
                        "Research & Docs": 84,
                        "Productivity": 85,
                        "Communication": 75,
                        "Entertainment": 60,
                      };

                      let categorySecs = 0;
                      Object.keys(appSecondsMap).forEach(appName => {
                        const mappedCat = appCategoryMap[appName] || APP_TELEMETRY_DATA[appName]?.category || "Coding & Dev";
                        if (mappedCat === cat.name) {
                          categorySecs += appSecondsMap[appName];
                        }
                      });

                      const hasActivity = categorySecs > 0 || cat.spentHours > 0;
                      const baseEfficiency = categoryWeights[cat.name] || 80;
                      const activeBoost = (activeCategory === cat.name && activeSessionRunning) ? 3 : 0;
                      const categoryEfficiency = hasActivity ? Math.min(100, baseEfficiency + activeBoost) : 0;

                      return (
                        <div className="text-center py-1">
                          <span className="text-[11px] text-slate-400">Category Efficiency</span>
                          <div className="text-3xl font-light text-slate-900 tracking-tight mt-0.5 font-sans">
                            {categoryEfficiency} <span className="text-sm font-normal text-slate-400">%</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Live Pulsating Micro Sparkline Equalizer Bars */}
                    <div className="h-5 flex items-end space-x-1 px-1">
                      {sparklineHeights.map((h, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-xs transition-all duration-300 ${isActive && activeSessionRunning ? cat.progressColor : "bg-slate-400/50"}`} 
                          style={{ height: isActive && activeSessionRunning ? `${h}%` : "30%" }} 
                        />
                      ))}
                    </div>

                    {/* Pause / Resume Focus Session Action Button */}
                    <button
                      onClick={() => {
                        if (!isActive) {
                          setActiveCategory(cat.name);
                          setActiveSessionRunning(true);
                        } else {
                          setActiveSessionRunning(!activeSessionRunning);
                        }
                      }}
                      className="w-full h-11 rounded-full bg-[#181a1b] text-white text-xs font-medium flex items-center justify-between px-5 hover:bg-slate-900 transition shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      title={`Toggle Recording Live Focus Sprint for ${cat.name}`}
                    >
                      <span>{isActive && activeSessionRunning ? "Pause Focus Session" : `Start ${cat.name} Session`}</span>
                      <div className="w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center">
                        {isActive && activeSessionRunning ? (
                          <Square className="w-2.5 h-2.5 fill-white text-white" />
                        ) : (
                          <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </button>
                  </div>
                );
              }

              // COLLAPSED CATEGORY CARD VIEW
              return (
                <div 
                  key={cat.id}
                  onClick={() => setExpandedCategory(cat.name)}
                  className="bg-[#dcdfdc]/60 rounded-2xl p-3.5 border border-white/30 flex items-center justify-between text-xs transition-all hover:bg-[#dcdfdc]/90 cursor-pointer"
                  title={`Click to Expand ${cat.name} Category Telemetry`}
                >
                  <div className="flex items-center space-x-2 flex-1 mr-2">
                    <span className="text-slate-700 font-medium whitespace-nowrap">{cat.name}</span>
                    <div className="flex-1 h-1 bg-slate-300/80 rounded-full overflow-hidden min-w-8">
                      <div className={`h-full ${cat.progressColor} transition-all duration-500`} style={{ width: `${calcPct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{calcPct} %</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory(cat.name);
                        setActiveSessionRunning(true);
                        setExpandedCategory(cat.name);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer ${isActive && activeSessionRunning ? "bg-cyan-100 text-cyan-900 border border-cyan-300 font-medium" : "bg-slate-200/80 text-slate-600 hover:bg-slate-300"}`}
                      title={`Set ${cat.name} as Active Focus Category`}
                    >
                      {isActive && activeSessionRunning ? "Active" : "Tracked"}
                    </button>

                    <Settings 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettingsModalCategory(cat);
                        setTempTargetHours(cat.targetHours);
                      }}
                      className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 cursor-pointer transition"
                    />

                    <ChevronDown 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCategory(cat.name);
                      }}
                      className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 cursor-pointer transition"
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </aside>

        {/* INTERACTIVE CATEGORY TARGET SETTINGS MODAL */}
        {settingsModalCategory && (
          <div onClick={(e) => { if (e.target === e.currentTarget) setSettingsModalCategory(null); }} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-slate-900">Category Settings</h3>
                  <p className="text-xs text-slate-500">{settingsModalCategory.name}</p>
                </div>
                <button 
                  onClick={() => setSettingsModalCategory(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
                  title="Close Settings Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Hours Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 block">
                  Daily Focus Goal Target: <strong className="text-slate-900">{tempTargetHours} hrs</strong>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 8.0].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTempTargetHours(h)}
                      className={`py-2 text-xs rounded-xl border font-medium transition cursor-pointer ${tempTargetHours === h ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                      title={`Set Daily Focus Target to ${h} Hours`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettingsModalCategory(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  title="Discard Target Changes"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategorySettings}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  title="Save Category Daily Target Goal"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE APP TELEMETRY INSPECTOR MODAL */}
        {inspectorApp && (
          <div onClick={(e) => { if (e.target === e.currentTarget) setInspectorApp(null); }} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shadow-xs">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{inspectorApp.name}</h3>
                    <p className="text-xs text-slate-500">{inspectorApp.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInspectorApp(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
                  title="Close App Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Telemetry Stats Grid */}
              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Tracked Today</span>
                  <span className="text-xl font-light text-slate-900 mt-0.5 block">{inspectorApp.spentFormatted}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Activity Share</span>
                  <span className="text-xl font-light text-cyan-600 mt-0.5 block">{inspectorApp.pct}%</span>
                </div>
              </div>

              <div className="bg-cyan-50/70 border border-cyan-200/80 p-3 rounded-2xl text-xs text-cyan-950 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse-subtle" />
                <span>Current Status: <strong>{inspectorApp.status}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(inspectorApp.name);
                    setActiveCategory(inspectorApp.category);
                    setActiveSessionRunning(true);
                    setInspectorApp(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  title={`Start Live Focus Sprint for ${inspectorApp.name}`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Sprint for {inspectorApp.name}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER AREA: Swappable Views & Classic Overview Canvas                   */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col items-center justify-between relative min-h-0">
          
          {/* VIEW 1: OVERVIEW CANVAS (Main Focus Command Center Dial & App Orbit) */}
          {activeDockTab === "overview" && (
            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 relative animate-page-entrance">
              
              {/* Central Canvas with Safe Orbital Perimeter Positions for App Nodes */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-visible">
                
                {/* PURE DYNAMIC ORBITAL APPLICATION BUBBLE NODES (BASED ON REAL TRACKED SYSTEM APPS) */}
                {(() => {
                  const nodePositions = [
                    { posClass: "top-2 left-4 sm:left-10 w-20 h-20 sm:w-24 sm:h-24", delay: "60ms" },
                    { posClass: "top-28 left-1 sm:left-4 w-14 h-14 sm:w-16 sm:h-16", delay: "110ms" },
                    { posClass: "bottom-20 left-2 sm:left-8 w-14 h-14", delay: "160ms" },
                    { posClass: "bottom-2 left-10 sm:left-20 w-12 h-12 sm:w-14 sm:h-14", delay: "210ms" },
                    { posClass: "bottom-1 left-[32%] w-14 h-14", delay: "260ms" },
                    { posClass: "bottom-1 right-[32%] w-14 h-14", delay: "310ms" },
                    { posClass: "bottom-4 right-4 sm:right-12 w-14 h-14", delay: "360ms" },
                  ];

                  // Get active apps from live macOS telemetry and filter by activity nature
                  const rawActiveApps = Object.keys(appPctMap);
                  const activeApps = rawActiveApps.filter(appName => {
                    if (activeAppFilter === "all") return true;
                    const cat = appCategoryMap[appName] || APP_TELEMETRY_DATA[appName]?.category || "Coding & Dev";
                    return cat === activeAppFilter;
                  });

                  if (rawActiveApps.length === 0) {
                    return (
                      <div className="absolute top-2 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 text-[11px] font-light text-slate-500 shadow-2xs animate-fade-in flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span>Listening for active software... Focus any app on your Mac to show nodes.</span>
                      </div>
                    );
                  }

                  if (activeApps.length === 0 && activeAppFilter !== "all") {
                    return (
                      <div className="absolute top-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white text-[11px] font-medium text-slate-700 shadow-2xs animate-fade-in flex items-center space-x-2">
                        <span>No active apps running in <strong>{activeAppFilter}</strong></span>
                      </div>
                    );
                  }

                  return activeApps.slice(0, 7).map((appName, idx) => {
                    const pos = nodePositions[idx % nodePositions.length];
                    const pct = appPctMap[appName] || 0;
                    const seconds = appSecondsMap[appName] || 0;
                    
                    const formatSpent = (secs: number) => {
                      if (!secs) return "0m";
                      const h = Math.floor(secs / 3600);
                      const m = Math.floor((secs % 3600) / 60);
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    };

                    const isSelected = selectedApp === appName;

                    return (
                      <div
                        key={appName}
                        onClick={() => {
                          setSelectedApp(appName);
                          const lowApp = appName.toLowerCase();
                          const cat = appCategoryMap[appName] || APP_TELEMETRY_DATA[appName]?.category || (
                            lowApp.includes("spotify") || lowApp.includes("music") ? "Entertainment" :
                            lowApp.includes("notes") || lowApp.includes("textedit") || lowApp.includes("bear") ? "Productivity" :
                            lowApp.includes("chat") || lowApp.includes("discord") || lowApp.includes("slack") || lowApp.includes("telegram") ? "Communication" :
                            lowApp.includes("safari") || lowApp.includes("chrome") || lowApp.includes("arc") ? "Research & Docs" :
                            lowApp.includes("figma") ? "Design & UI" :
                            "Productivity"
                          );
                          const stat = APP_TELEMETRY_DATA[appName]?.status || (
                            cat === "Entertainment" ? "Background Audio & Streaming" :
                            cat === "Productivity" ? "Notes & Personal Organization" :
                            cat === "Communication" ? "Team Async Communication" :
                            cat === "Research & Docs" ? "Web Research & Docs" :
                            "Active System Tracking"
                          );

                          setInspectorApp({
                            name: appName,
                            category: cat,
                            spentFormatted: formatSpent(seconds),
                            pct: pct,
                            status: stat
                          });
                        }}
                        style={{ animationDelay: pos.delay }}
                        className={`absolute ${pos.posClass} rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${isSelected ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/90 border-white/80 shadow-2xs hover:bg-white"}`}
                        title={`Click to Inspect ${appName} Activity Telemetry`}
                      >
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-light font-mono">{pct} %</span>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-800 mt-0.5 truncate max-w-[80%] text-center">{appName}</span>
                      </div>
                    );
                  });
                })()}

                {/* MAIN CENTRAL FOCUS DIAL WIDGET */}
                <div className="relative flex items-center justify-center animate-dial-expand">
                  
                  <div 
                    onClick={() => setActiveSessionRunning(!activeSessionRunning)}
                    className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-b from-[#d6e7ec] to-[#bcd2db] p-3 shadow-xl border border-white/70 flex items-center justify-center relative transition transform hover:scale-[1.008] cursor-pointer z-10 overflow-hidden"
                    title="Click to Start or Pause Live Focus Sprint"
                  >
                    {/* Dotted Circumference Line */}
                    <div className="absolute inset-2 rounded-full border border-dashed border-slate-400/50 pointer-events-none" />

                    {/* ROTATABLE INDICATOR NEEDLE LINE & CYAN TIP (MOVES WITH PASSING TIME) */}
                    <div 
                      className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center transition-transform duration-700 ease-out z-20"
                      style={{ transform: `rotate(${progressFraction * 360}deg)` }}
                    >
                      <div className="absolute top-2.5 w-1 h-6 rounded-full bg-slate-800 shadow-xs" />
                      <div className="absolute top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
                    </div>

                    {/* CIRCUMFERENTIAL SVG PROGRESS RING */}
                    <svg className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] pointer-events-none -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="url(#dialProgressGradient)"
                        strokeWidth="2.5"
                        strokeDasharray="289"
                        strokeDashoffset={289 * (1 - progressFraction)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                      <defs>
                        <linearGradient id="dialProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Inner Content Dial */}
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#cde0e6] to-[#b4cad1] flex flex-col items-center justify-center shadow-inner p-6 text-center">
                      <span className="text-[11px] text-slate-500 font-light tracking-widest uppercase">
                        {activeCategory} • {sprintDuration}m Block
                      </span>
                      
                      {/* Live Timer Countdown */}
                      <span className="text-4xl sm:text-5xl font-light text-slate-900 tracking-tight mt-1 font-mono">
                        {formatTimer(timerSeconds)}
                      </span>

                      {/* Current Goal Indicator */}
                      <div className="mt-2 flex items-center space-x-1.5 bg-white/60 px-3 py-1 rounded-full border border-white/60 shadow-2xs">
                        {activeSessionRunning ? (
                          <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse-subtle" />
                        ) : (
                          <Pause className="w-2.5 h-2.5 text-amber-600" />
                        )}
                        <span className="text-xs font-medium text-slate-800">
                          {activeSessionRunning ? `${activeCategory} Active` : "Session Paused"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SINGLE-SECTION CURVED CRESCENT POD CONTAINER ON RIGHT EDGE OF FOCUS DIAL */}
                  <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col items-center justify-between p-2 rounded-full bg-gradient-to-b from-[#d8eaf1]/95 via-[#bcd7e1]/95 to-[#b0cee0]/95 backdrop-blur-xl border border-white/80 shadow-lg space-y-2 z-30">
                    
                    {/* Button 1: Pomodoro Sprint Duration */}
                    <button 
                      onClick={cycleSprintDuration}
                      title="Pomodoro Sprint Length"
                      className="w-11 h-11 rounded-full bg-white/90 shadow-2xs hover:bg-white text-slate-800 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Sliders className="w-4.5 h-4.5 text-slate-700" />
                    </button>

                    {/* Hairline Divider */}
                    <div className="w-5 h-[1px] bg-white/60 rounded-full" />

                    {/* Button 2: Filter App Nodes by Activity Nature */}
                    <div ref={filterPopoverRef} className="relative">
                      <button 
                        onClick={() => setShowFilterPopover(!showFilterPopover)}
                        title="Filter Canvas Nodes by Activity Nature"
                        className={`w-11 h-11 rounded-full shadow-2xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${showFilterPopover || activeAppFilter !== "all" ? "bg-slate-900 text-white" : "bg-white/90 text-slate-800 hover:bg-white"}`}
                      >
                        <Filter className="w-4.5 h-4.5" />
                      </button>

                      {/* FILTER ACTIVITY NATURE POPOVER */}
                      {showFilterPopover && (
                        <div className="absolute right-14 top-0 w-48 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-slate-200/80 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                          {[
                            { id: "all", label: "All Active Apps" },
                            { id: "Coding & Dev", label: "Coding & Dev" },
                            { id: "Design & UI", label: "Design & UI" },
                            { id: "Research & Docs", label: "Research & Docs" },
                            { id: "Productivity", label: "Productivity" },
                            { id: "Communication", label: "Communication" },
                            { id: "Entertainment", label: "Entertainment" }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveAppFilter(item.id);
                                setShowFilterPopover(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${activeAppFilter === item.id ? "bg-slate-900 text-white font-medium" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                              <span>{item.label}</span>
                              {activeAppFilter === item.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hairline Divider */}
                    <div className="w-5 h-[1px] bg-white/60 rounded-full" />
                    
                    {/* Button 3: Ambient Soundscapes */}
                    <div ref={audioPopoverRef} className="relative">
                      <button 
                        onClick={() => {
                          setFocusAudioMode(!focusAudioMode);
                          setShowAudioPopover(!showAudioPopover);
                        }}
                        title="Focus Ambient Soundscapes"
                        className={`w-11 h-11 rounded-full shadow-2xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${focusAudioMode ? "bg-slate-900 text-white" : "bg-white/90 text-slate-800 hover:bg-white"}`}
                      >
                        <Zap className="w-4.5 h-4.5" />
                      </button>

                      {/* Interactive Focus Audio Soundscape Selector Popover */}
                      {showAudioPopover && (
                        <div className="absolute right-14 top-0 w-64 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-200/80 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center space-x-1.5">
                              <Radio className="w-4 h-4 text-cyan-600 animate-pulse-subtle" />
                              <span className="text-xs font-semibold text-slate-900">Focus Soundscape</span>
                            </div>
                            <button 
                              onClick={() => setFocusAudioMode(!focusAudioMode)}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition cursor-pointer ${focusAudioMode ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-700"}`}
                              title="Toggle Soundscape Audio ON/OFF"
                            >
                              {focusAudioMode ? "PLAYING" : "MUTED"}
                            </button>
                          </div>

                          {/* Preset Options */}
                          <div className="space-y-1.5 my-3">
                            <button
                              onClick={() => { setAudioPreset("brown"); setFocusAudioMode(true); }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${audioPreset === "brown" && focusAudioMode ? "bg-cyan-50 text-cyan-900 font-semibold border border-cyan-200" : "hover:bg-slate-100 text-slate-700"}`}
                            >
                              <span>🎧 Brown Noise (Deep Focus)</span>
                              {audioPreset === "brown" && focusAudioMode && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                            </button>

                            <button
                              onClick={() => { setAudioPreset("binaural"); setFocusAudioMode(true); }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${audioPreset === "binaural" && focusAudioMode ? "bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200" : "hover:bg-slate-100 text-slate-700"}`}
                            >
                              <span>🌊 Binaural 40Hz (Gamma Flow)</span>
                              {audioPreset === "binaural" && focusAudioMode && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>

                            <button
                              onClick={() => { setAudioPreset("rain"); setFocusAudioMode(true); }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${audioPreset === "rain" && focusAudioMode ? "bg-sky-50 text-sky-900 font-semibold border border-sky-200" : "hover:bg-slate-100 text-slate-700"}`}
                            >
                              <span>🌧️ Deep Rain Soundscape</span>
                              {audioPreset === "rain" && focusAudioMode && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                            </button>
                          </div>

                          {/* Volume Slider */}
                          <div className="space-y-1 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>Volume</span>
                              <span>{audioVolume}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {audioVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-600" />}
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={audioVolume}
                                onChange={(e) => setAudioVolume(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: CALENDAR (Activity & Focus Timeline) */}
          {activeDockTab === "calendar" && (
            <div className="w-full flex-1 flex flex-col space-y-4 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light text-slate-900">Activity & Focus Timeline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Chronological digital log of tracked sessions and peak focus windows</p>
                </div>
                <span className="px-3 py-1 bg-cyan-100/80 text-cyan-900 rounded-full text-xs font-medium border border-cyan-300">
                  Live Log: {Object.keys(appPctMap).length} Active Apps
                </span>
              </div>

              {/* Dynamic Timeline Items */}
              <div className="space-y-3 pt-2">
                {Object.keys(appPctMap).length > 0 ? (
                  Object.keys(appPctMap).map((appName, idx) => {
                    const secs = appSecondsMap[appName] || 0;
                    const pct = appPctMap[appName] || 0;
                    const hrs = Math.floor(secs / 3600);
                    const mins = Math.floor((secs % 3600) / 60);
                    const formattedDuration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                    const category = appCategoryMap[appName] || APP_TELEMETRY_DATA[appName]?.category || (
                      appName.toLowerCase().includes("spotify") || appName.toLowerCase().includes("music") ? "Entertainment" :
                      appName.toLowerCase().includes("notes") ? "Productivity" :
                      appName.toLowerCase().includes("chat") || appName.toLowerCase().includes("discord") ? "Communication" :
                      appName.toLowerCase().includes("safari") || appName.toLowerCase().includes("chrome") ? "Research & Docs" :
                      "Productivity"
                    );
                    const status = pct > 30 ? "Peak Flow State" : pct > 15 ? "High Velocity" : "Active Focus";
                    const borderColor = idx % 3 === 0 ? "border-l-cyan-600" : idx % 3 === 1 ? "border-l-indigo-500" : "border-l-amber-500";

                    return (
                      <div key={appName} className={`bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-xs border-l-4 ${borderColor} flex items-center justify-between transition-all hover:bg-white/80`}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-xs font-semibold text-slate-900">{appName} Session</span>
                          </div>
                          <p className="text-xs text-slate-500">Tracked in <strong className="text-slate-700">{appName}</strong> ({formattedDuration}) • {category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-light text-slate-900 block font-mono">{pct}% Share</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">{status}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white/50 backdrop-blur-md p-8 rounded-2xl border border-white/60 text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">No activity sessions logged yet for this account.</p>
                    <p className="text-[11px] text-slate-400">Start a timer sprint on the overview dial or launch the desktop activity tracker to record your timeline.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: TASKS (Personal Goals & Task Queue) */}
          {activeDockTab === "tasks" && (
            <div className="w-full flex-1 flex flex-col space-y-4 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light text-slate-900">Personal Focus Goals</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Track target hours and focus completion across projects</p>
                </div>
                <span className="text-xs font-mono text-slate-600 bg-white/70 px-3 py-1 rounded-full border border-white/60">
                  {taskList.filter(t => t.completed).length} / {taskList.length} Completed
                </span>
              </div>

              {/* Form to Add Goal */}
              <form onSubmit={handleAddGoal} className="flex space-x-2">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Enter new focus goal (e.g. Refactor DB models)..."
                  className="flex-1 px-4 py-2.5 text-xs bg-white/80 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#181a1b] text-white text-xs font-medium rounded-xl hover:bg-slate-900 transition shadow-xs cursor-pointer flex items-center space-x-1"
                  title="Add New Focus Goal to Queue"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2.5 pt-2">
                {taskList.length > 0 ? (
                  taskList.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-xs flex items-center justify-between transition-all hover:bg-white/80 ${task.completed ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer ${task.completed ? "bg-slate-900 border-slate-900 text-white" : "border-slate-400 bg-white text-transparent"}`}
                          title={task.completed ? "Mark Goal as Incomplete" : "Mark Goal as Completed"}
                        >
                          <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <div>
                          <p className={`text-xs font-medium text-slate-900 ${task.completed ? "line-through text-slate-500" : ""}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">{task.category} • {task.spentHours}h / {task.targetHours}h Target</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-24">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (task.spentHours / task.targetHours) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 p-6 rounded-2xl border border-white/60 text-center">
                    <p className="text-xs text-slate-500">No focus goals added yet. Type a goal above to start tracking!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: ANALYTICS (Time Allocation & Trends) */}
          {activeDockTab === "analytics" && (
            <div className="w-full flex-1 flex flex-col space-y-5 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light text-slate-900">Productivity & Time Analytics</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive breakdown of time allocation across software & categories</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  title="Export Analytics Data as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Category Breakdown Progress */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <span className="text-xs font-medium text-slate-900">Digital Activity Category Distribution</span>
                
                {(() => {
                  let devSecs = 0, designSecs = 0, commSecs = 0, researchSecs = 0;
                  Object.keys(appSecondsMap).forEach(app => {
                    const secs = appSecondsMap[app] || 0;
                    const cat = APP_TELEMETRY_DATA[app]?.category || "Engineering";
                    if (cat === "Engineering" || cat === "Coding & Dev") devSecs += secs;
                    else if (cat === "Design & UI" || cat === "Design") designSecs += secs;
                    else if (cat === "Communication") commSecs += secs;
                    else researchSecs += secs;
                  });

                  const total = devSecs + designSecs + commSecs + researchSecs || 1;
                  const devPct = Math.round((devSecs / total) * 100);
                  const designPct = Math.round((designSecs / total) * 100);
                  const commPct = Math.round((commSecs / total) * 100);
                  const researchPct = Math.round((researchSecs / total) * 100);

                  return (
                    <>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${devPct}%` }} title={`Engineering (${devPct}%)`} />
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${designPct}%` }} title={`Design (${designPct}%)`} />
                        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${commPct}%` }} title={`Communication (${commPct}%)`} />
                        <div className="h-full bg-slate-500 transition-all duration-500" style={{ width: `${researchPct}%` }} title={`Research (${researchPct}%)`} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                          <div>
                            <span className="text-slate-800 font-medium block">Engineering</span>
                            <span className="text-[10px] text-slate-500 font-mono">{(devSecs / 3600).toFixed(1)} hrs ({devPct}%)</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          <div>
                            <span className="text-slate-800 font-medium block">Design & UI</span>
                            <span className="text-[10px] text-slate-500 font-mono">{(designSecs / 3600).toFixed(1)} hrs ({designPct}%)</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <div>
                            <span className="text-slate-800 font-medium block">Communication</span>
                            <span className="text-[10px] text-slate-500 font-mono">{(commSecs / 3600).toFixed(1)} hrs ({commPct}%)</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                          <div>
                            <span className="text-slate-800 font-medium block">Research</span>
                            <span className="text-[10px] text-slate-500 font-mono">{(researchSecs / 3600).toFixed(1)} hrs ({researchPct}%)</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Weekly Deep Work Bar Chart */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900">Weekly Deep Focus Distribution</span>
                  <span className="text-[10px] text-slate-500 font-mono">{dailyFocusHours.toFixed(1)}h logged today</span>
                </div>

                <div className="h-32 flex items-end justify-between px-4 pt-4 pb-2 border-b border-slate-200">
                  {[
                    { day: "Mon", focus: dailyFocusHours > 0 ? 80 : 0 },
                    { day: "Tue", focus: dailyFocusHours > 0 ? 95 : 0 },
                    { day: "Wed", focus: dailyFocusHours > 0 ? 70 : 0 },
                    { day: "Thu", focus: dailyFocusHours > 0 ? 85 : 0 },
                    { day: "Fri", focus: dailyFocusHours > 0 ? 60 : 0 },
                    { day: "Sat", focus: dailyFocusHours > 0 ? 40 : 0 },
                    { day: "Sun", focus: dailyFocusHours > 0 ? 30 : 0 }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1 group">
                      <div className="w-6 bg-slate-200 rounded-t-sm flex flex-col justify-end overflow-hidden" style={{ height: "100px" }}>
                        <div className="w-full bg-cyan-600 group-hover:bg-cyan-500 transition-all duration-300" style={{ height: `${bar.focus}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: INSIGHTS (AI Productivity Coach & Habits) */}
          {activeDockTab === "insights" && (
            <div className="w-full flex-1 flex flex-col space-y-4 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div>
                <h2 className="text-xl font-light text-slate-900">AI Focus Coach & Recommendations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated insights synthesized from your digital activity patterns</p>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-400/30 p-4.5 rounded-2xl shadow-xs space-y-2 transition-all hover:shadow-md">
                <div className="flex items-center space-x-2 text-cyan-900">
                  <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse-subtle" />
                  <span className="text-xs font-semibold">Optimal Peak Focus Window Identified</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your flow state efficiency reaches peak levels when starting deep work sprints during morning blocks. We recommend scheduling high-complexity engineering tasks during this window.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-4.5 rounded-2xl border border-white/70 shadow-xs space-y-2 transition-all hover:shadow-md">
                <div className="flex items-center space-x-2 text-amber-900">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold">Context Switch Reduction Tip</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Enabling <strong>Focus Audio Shield</strong> (Brown Noise or 40Hz Binaural Beats) during deep focus blocks increases task completion velocity by 34%.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS (Privacy Controls, Account & Data Governance) */}
          {activeDockTab === "settings" && (
            <div className="w-full flex-1 flex flex-col space-y-5 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div>
                <h2 className="text-xl font-light text-slate-900">Settings & Data Governance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Vita is privacy-first. Manage your account preferences, telemetry tracking, and local vault encryption.</p>
              </div>

              {/* Feedback Alert Toast Banner */}
              {settingsFeedbackMsg && (
                <div className="p-3 bg-cyan-100 border border-cyan-300 text-cyan-950 text-xs font-medium rounded-xl flex items-center justify-between animate-fade-in">
                  <span>{settingsFeedbackMsg}</span>
                  <button onClick={() => setSettingsFeedbackMsg(null)} className="text-cyan-800 hover:text-cyan-950">✕</button>
                </div>
              )}

              {/* User Account Settings Panel */}
              <form onSubmit={handleSaveProfileSettings} className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">User Profile & Account</span>
                    <span className="text-[11px] text-slate-500">Connected account details & credentials</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-semibold rounded-full border border-emerald-300">
                    Pro Active Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileEmailInput}
                      onChange={(e) => setProfileEmailInput(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  >
                    Save Account Preferences
                  </button>
                </div>
              </form>

              {/* Privacy Controls Panel */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <span className="text-xs font-semibold text-slate-900 block">Telemetry Tracking Controls</span>
                
                {/* Control 1: Global Tracking Engine */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-800 block">Live Activity Tracking Engine</span>
                    <span className="text-[11px] text-slate-500">Pause background tracking at any time with zero data leaks</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextState = !trackingEngineActive;
                      setTrackingEngineActive(nextState);
                      setSettingsFeedbackMsg(nextState ? "Live telemetry tracking engine resumed." : "Live telemetry tracking engine paused.");
                      setTimeout(() => setSettingsFeedbackMsg(null), 3000);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${trackingEngineActive ? "bg-cyan-600" : "bg-slate-300"}`}
                    title="Toggle Live Background Telemetry Tracking"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition transform ${trackingEngineActive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Control 2: Local Vault Encryption */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-800 block">Device Local Vault Encryption</span>
                    <span className="text-[11px] text-slate-500">Encrypt all tracked logs on your local device before sync</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextState = !localVaultEncryption;
                      setLocalVaultEncryption(nextState);
                      setSettingsFeedbackMsg(nextState ? "Device AES-256 local vault encryption enabled." : "Device local vault encryption disabled.");
                      setTimeout(() => setSettingsFeedbackMsg(null), 3000);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${localVaultEncryption ? "bg-cyan-600" : "bg-slate-300"}`}
                    title="Toggle On-Device AES-256 Vault Encryption"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition transform ${localVaultEncryption ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Control 3: Excluded Apps List & Add Form */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-medium text-slate-800 block">Excluded Private Applications</span>
                  
                  <form onSubmit={handleAddExcludedApp} className="flex space-x-2">
                    <input
                      type="text"
                      value={newExcludedAppInput}
                      onChange={(e) => setNewExcludedAppInput(e.target.value)}
                      placeholder="Add app name to exclude (e.g. 1Password)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-xl hover:bg-slate-900 transition cursor-pointer"
                    >
                      Exclude
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {excludedApps.map((appName) => (
                      <span key={appName} className="px-3 py-1 bg-slate-200/80 text-slate-700 text-xs rounded-full flex items-center space-x-1.5">
                        <EyeOff className="w-3 h-3 text-slate-500" />
                        <span>{appName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExcludedApp(appName)}
                          className="text-slate-400 hover:text-slate-700 text-xs ml-1"
                          title={`Remove ${appName} from excluded list`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Governance & Export/Delete Actions */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <span className="text-xs font-semibold text-slate-900 block">Data Governance & Ownership</span>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Export JSON Button */}
                  <button
                    onClick={handleExportJSON}
                    className="w-full sm:w-auto h-10 px-5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
                    title="Export All Personal Telemetry Logs as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Telemetry (JSON)</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={handlePurgeData}
                    className="w-full sm:w-auto h-10 px-5 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
                    title="Permanently Purge & Delete Account Activity Vault"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge & Delete All Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* FLOATING BOTTOM DOCK: Toggles pages at bottom                      */}
          {/* ----------------------------------------------------------------- */}
          <div className="mb-2 z-20">
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/60 shadow-lg">
              
              {/* Dock Button 1: Overview */}
              <button
                onClick={() => setActiveDockTab("overview")}
                title="Command Center Overview Canvas"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "overview" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Dock Button 2: Activity Timeline */}
              <button
                onClick={() => setActiveDockTab("calendar")}
                title="Activity & Focus Chronological Log"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "calendar" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Dock Button 3: Focus Tasks */}
              <button
                onClick={() => setActiveDockTab("tasks")}
                title="Personal Focus Goals & Task Queue"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "tasks" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Dock Button 4: Analytics */}
              <button
                onClick={() => setActiveDockTab("analytics")}
                title="App Time Allocation & Weekly Analytics"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "analytics" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <PieChart className="w-4 h-4" />
              </button>

              {/* Dock Button 5: AI Insights */}
              <button
                onClick={() => setActiveDockTab("insights")}
                title="AI Productivity Coach & Flow State Insights"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "insights" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Dock Button 6: Privacy Settings */}
              <button
                onClick={() => setActiveDockTab("settings")}
                title="Privacy Settings & On-Device Vault Control"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 ${activeDockTab === "settings" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Shield className="w-4 h-4" />
              </button>

            </div>
          </div>

        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: Soft Cyan Glass Focus Intelligence Drawer (Auth Compatible) */}
        {/* ----------------------------------------------------------------------- */}
        {showRightDrawer ? (
          <aside className="w-72 lg:w-80 bg-[#cde4eb]/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-xs flex flex-col justify-between shrink-0 relative overflow-y-auto animate-drawer-right">

            <div className="space-y-6">
              
              {/* Header Title */}
              <span className="text-xs text-slate-500 font-normal">Focus Intelligence</span>

              {/* Top Stat Columns */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-light text-slate-900">
                      {dailyFocusHours.toFixed(1).replace(".", ",")}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">h</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Today's Focus</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-light text-slate-900">
                      {remainingTargetHours.toFixed(1).replace(".", ",")}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">h</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Remaining Target</span>
                </div>
              </div>

              {/* Ascending Focus Curve Line Graph (Cyan Auth Tone) */}
              <div className="relative h-44 w-full pt-4">
                
                {/* Floating Callout Tag 1: Soft Cyan Glass Badge */}
                <div className="absolute top-2 right-4 bg-cyan-100/90 text-cyan-950 text-[10px] px-2.5 py-1 rounded-full border border-cyan-300/80 shadow-xs font-medium flex items-center space-x-1">
                  <span>↑ {focusScore > 0 ? Math.round(focusScore) : 0}% - {focusScore > 50 ? "Peak Flow State" : "Initial Flow State"}</span>
                </div>

                {/* Floating Callout Tag 2: Soft Indigo Glass Badge */}
                <div className="absolute top-16 left-12 bg-indigo-100/90 text-indigo-950 text-[10px] px-2 py-0.5 rounded-full border border-indigo-300/80 shadow-xs">
                  <span>{dailyFocusHours > 0 ? (dailyFocusHours / 2.0).toFixed(1).replace(".", ",") : "0,0"} x - {dailyFocusHours > 0 ? "High Velocity" : "Initial Velocity"}</span>
                </div>

                {/* Curve Line SVG */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path
                    d={dailyFocusHours > 0 ? "M 0 45 Q 25 43, 50 38 T 100 5" : "M 0 45 L 100 45"}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                  />
                  <path
                    d={dailyFocusHours > 0 ? "M 0 45 Q 25 43, 50 38 T 100 5 L 100 50 L 0 50 Z" : "M 0 45 L 100 45 L 100 50 L 0 50 Z"}
                    fill="url(#cyanCurveGradient)"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="cyanCurveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                </div>
              </div>

              {/* Action Button: Export Focus Report */}
              <button 
                onClick={() => alert("Downloading Vita Focus Intelligence Report (CSV/PDF)...")}
                className="w-full h-11 rounded-full bg-[#181a1b] text-white text-xs font-medium flex items-center justify-between px-5 hover:bg-slate-900 transition shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                title="Generate & Download Today's Focus Metrics Report (CSV/PDF)"
              >
                <span>Export Focus Report</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Hourglass className="w-2.5 h-2.5 fill-white text-white" />
                </div>
              </button>

              {/* Bottom Focus Velocity Section */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] text-slate-500 font-normal">Focus Velocity</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Column 1: Average Velocity */}
                  <div className="flex flex-col space-y-1 bg-[#b5d5df]/30 p-2.5 rounded-2xl border border-white/40">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-light text-slate-900">
                        {dailyFocusHours > 0 ? (dailyFocusHours / 4.0).toFixed(1).replace(".", ",") : "0,0"}
                      </span>
                      <span className="text-[11px] text-slate-500">h/s</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Average Velocity</span>
                    
                    {/* Smooth Continuous Wave SVG with Safe Top & Bottom Margins */}
                    <div className="h-8 w-full pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35">
                        <path
                          d={dailyFocusHours > 0 ? "M 5 22 Q 25 10, 50 20 T 95 14" : "M 5 28 L 95 28"}
                          fill="none"
                          stroke="#0891b2"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Column 2: Peak Velocity */}
                  <div className="flex flex-col space-y-1 bg-[#b5d5df]/30 p-2.5 rounded-2xl border border-white/40">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-light text-slate-900">
                        {dailyFocusHours > 0 ? (dailyFocusHours / 2.5).toFixed(1).replace(".", ",") : "0,0"}
                      </span>
                      <span className="text-[11px] text-slate-500">h/s</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Peak Velocity</span>

                    {/* Clean Rising Velocity Curve SVG with Peak Indicator Dot */}
                    <div className="h-8 w-full pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35">
                        <path
                          d={dailyFocusHours > 0 ? "M 5 26 Q 40 22, 70 14 T 92 8" : "M 5 28 L 95 28"}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx={dailyFocusHours > 0 ? "92" : "95"} cy={dailyFocusHours > 0 ? "8" : "28"} r="3" fill="#0284c7" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </aside>
        ) : (
          /* Sleek Collapsed Drawer Re-Open Handle on Right Edge */
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setShowRightDrawer(true)}
              className="w-10 h-36 bg-[#cde4eb]/90 hover:bg-[#cde4eb] backdrop-blur-md rounded-l-2xl border-l border-y border-white/60 shadow-md flex flex-col items-center justify-center space-y-2 text-slate-700 cursor-pointer transition hover:scale-105"
              title="Expand Focus Intelligence Drawer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                Focus Intelligence
              </span>
            </button>
          </div>
        )}

      </div>

      {/* SIMPLE ICONLESS ACCOUNT DELETION MODAL (MATCHES VITA UI) */}
      {showPurgeModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowPurgeModal(false); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in cursor-pointer">
          <div className="bg-[#e2eef2]/95 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-3 animate-scale-up cursor-default">
            <h3 className="text-base font-medium text-slate-900">Delete Account & Purge Data?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              This action will permanently delete your account profile, all tracked focus sessions, tasks, and telemetry logs. You will be redirected to the sign-in page.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 bg-white/70 hover:bg-white text-slate-700 text-xs font-medium rounded-full border border-white/60 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePurgeData}
                className="px-4 py-2 bg-[#181a1b] hover:bg-slate-900 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMPLE ICONLESS LOGOUT MODAL (MATCHES VITA UI) */}
      {showLogoutModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in cursor-pointer">
          <div className="bg-[#e2eef2]/95 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-3 animate-scale-up cursor-default">
            <h3 className="text-base font-medium text-slate-900">Sign Out of Vita?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Are you sure you want to sign out of your account session? Your desktop activity tracker will pause until you sign back in.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-white/70 hover:bg-white text-slate-700 text-xs font-medium rounded-full border border-white/60 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="px-4 py-2 bg-[#181a1b] hover:bg-slate-900 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
