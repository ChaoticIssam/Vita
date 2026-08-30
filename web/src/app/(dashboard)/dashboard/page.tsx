"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TypewriterSessionLoader } from "../layout";
import { DockNav } from "@/components/navigation/DockNav";
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
  ChevronRight,
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
  Code2,
  Palette,
  BookOpen,
  BarChart3,
  Briefcase,
  Volume2,
  VolumeX,
  Radio,
  X,
  Laptop,
  Target
} from "lucide-react";

type DockTab = "overview" | "calendar" | "tasks" | "analytics" | "insights" | "settings";

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

interface FocusSessionItem {
  id: string;
  duration_minutes: number;
  efficiency_score: number;
  app_name: string;
  category: string;
  created_at: string;
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
  // Coding & Dev
  "VS Code": { name: "VS Code", category: "Coding & Dev", spentFormatted: "2h 10m", pct: 22, status: "Active Software Engineering" },
  "Cursor": { name: "Cursor", category: "Coding & Dev", spentFormatted: "2h 45m", pct: 30, status: "AI Pair Programming" },
  "Xcode": { name: "Xcode", category: "Coding & Dev", spentFormatted: "1h 50m", pct: 20, status: "iOS Development" },
  "Android Studio": { name: "Android Studio", category: "Coding & Dev", spentFormatted: "1h 40m", pct: 18, status: "Mobile App Building" },
  "IntelliJ IDEA": { name: "IntelliJ IDEA", category: "Coding & Dev", spentFormatted: "2h 00m", pct: 25, status: "Backend Java / Kotlin" },
  "PyCharm": { name: "PyCharm", category: "Coding & Dev", spentFormatted: "1h 30m", pct: 15, status: "Python Scripting" },
  "iTerm": { name: "iTerm", category: "Coding & Dev", spentFormatted: "1h 50m", pct: 58, status: "CLI Deployments" },
  "Terminal": { name: "Terminal", category: "Coding & Dev", spentFormatted: "1h 00m", pct: 12, status: "Shell Work" },
  "Postman": { name: "Postman", category: "Coding & Dev", spentFormatted: "1h 15m", pct: 30, status: "API Endpoint Testing" },
  "Docker": { name: "Docker", category: "Coding & Dev", spentFormatted: "1h 20m", pct: 64, status: "Container Management" },
  "OrbStack": { name: "OrbStack", category: "Coding & Dev", spentFormatted: "1h 20m", pct: 12, status: "Virtualization" },
  "Antigravity": { name: "Antigravity", category: "Coding & Dev", spentFormatted: "3h 40m", pct: 38, status: "AI Agentic Development" },

  // Design & UI
  "Figma": { name: "Figma", category: "Design & UI", spentFormatted: "1h 15m", pct: 15, status: "Design Tokens & Wireframes" },
  "Adobe Illustrator": { name: "Adobe Illustrator", category: "Design & UI", spentFormatted: "1h 45m", pct: 35, status: "Vector Illustration" },
  "Photoshop": { name: "Photoshop", category: "Design & UI", spentFormatted: "1h 30m", pct: 28, status: "Raster Graphics" },
  "Premiere Pro": { name: "Premiere Pro", category: "Design & UI", spentFormatted: "2h 10m", pct: 42, status: "Video Editing" },
  "Blender": { name: "Blender", category: "Design & UI", spentFormatted: "2h 30m", pct: 60, status: "3D Modeling & Rendering" },

  // Reading & Research
  "Safari": { name: "Safari", category: "Reading & Research", spentFormatted: "2h 15m", pct: 24, status: "Documentation Browsing" },
  "Chrome": { name: "Chrome", category: "Reading & Research", spentFormatted: "1h 00m", pct: 10, status: "Web Research" },
  "Arc": { name: "Arc", category: "Reading & Research", spentFormatted: "1h 40m", pct: 20, status: "Tab Workspace Research" },
  "Firefox": { name: "Firefox", category: "Reading & Research", spentFormatted: "1h 10m", pct: 14, status: "Web Browsing" },

  // Writing & Docs
  "Notion": { name: "Notion", category: "Writing & Docs", spentFormatted: "1h 30m", pct: 57, status: "Knowledge Base & Specs" },
  "Obsidian": { name: "Obsidian", category: "Writing & Docs", spentFormatted: "1h 10m", pct: 45, status: "Markdown Notes" },
  "Word": { name: "Word", category: "Writing & Docs", spentFormatted: "1h 00m", pct: 20, status: "Document Editing" },

  // Data & Analytics
  "Jupyter": { name: "Jupyter", category: "Data & Analytics", spentFormatted: "2h 00m", pct: 50, status: "Data Science Notebooks" },
  "TablePlus": { name: "TablePlus", category: "Data & Analytics", spentFormatted: "1h 25m", pct: 40, status: "SQL Querying" },
  "Excel": { name: "Excel", category: "Data & Analytics", spentFormatted: "1h 35m", pct: 32, status: "Financial Modeling" },

  // Product & Strategy
  "Linear": { name: "Linear", category: "Product & Strategy", spentFormatted: "1h 05m", pct: 25, status: "Sprint Planning" },
  "Jira": { name: "Jira", category: "Product & Strategy", spentFormatted: "1h 15m", pct: 30, status: "Issue Tracking" },
  "Slack": { name: "Slack", category: "Product & Strategy", spentFormatted: "2h 05m", pct: 72, status: "Team Coordination" },
  "Discord": { name: "Discord", category: "Product & Strategy", spentFormatted: "1h 45m", pct: 18, status: "Community & Syncs" }
};

function DashboardLoadingSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const loadingMessages = [
      "Initializing private focus vault...",
      "Calibrating telemetry intelligence...",
      "Preparing ambient soundscapes...",
      "Opening your Vita focus studio..."
    ];
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Initializing private focus vault...",
    "Calibrating telemetry intelligence...",
    "Preparing ambient soundscapes...",
    "Opening your Vita focus studio..."
  ];

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#07080d] text-white flex flex-col items-center justify-center relative select-none font-sans">
      {/* Ambient Relaxing Refraction Light Beams */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/12 via-indigo-600/10 to-teal-400/8 blur-[120px] animate-pulse-subtle" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-cyan-400/10 blur-[80px] animate-pulse" />

      {/* Main Relaxing Glass Container Card */}
      <div className="relative z-10 flex flex-col items-center justify-center p-10 max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(34,211,238,0.06)] transition-all">
        {/* Central Breathing Ring & Orbit Node */}
        <div className="relative w-52 h-52 flex items-center justify-center my-4">
          {/* Outer Dashed Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-300/25 animate-spin-slow" />

          {/* Inner Glowing Breathing Circle */}
          <div className="absolute inset-4 rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent backdrop-blur-md animate-breathe-pulse flex items-center justify-center" />

          {/* Central Logo & Pulse Dot */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
            <h1 className="font-[family-name:var(--font-hubballi)] text-5xl font-normal tracking-tight text-white flex items-center">
              vita<span className="text-[9px] font-sans font-light tracking-widest relative -top-3 ml-0.5 opacity-60 text-cyan-200">TM</span>
            </h1>
            <div className="flex items-center space-x-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/70 font-medium">Session Syncing</span>
            </div>
          </div>
        </div>

        {/* Rotating Soothing Status Message */}
        <div className="h-8 flex items-center justify-center mt-3 mb-2">
          <p className="text-[13px] font-light tracking-wide text-slate-300/80 animate-page-entrance transition-all text-center">
            {messages[messageIndex]}
          </p>
        </div>

        {/* Sleek Ambient Progress Beam Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative mt-2">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-teal-300 w-full animate-pulse" />
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
        <p className="text-[11px] font-light tracking-[0.2em] text-slate-400/60 uppercase">
          Activity & Focus Intelligence
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !token && typeof window !== "undefined" && !localStorage.getItem("vita_token")) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  // Component Refs for Click-Outside Listeners
  const userMenuRef = useRef<HTMLDivElement>(null);
  const audioPopoverRef = useRef<HTMLDivElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const pendingClassificationRef = useRef<Set<string>>(new Set());
  const [isInitialDataLoading, setIsInitialDataLoading] = useState<boolean>(true);

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
  const [serverSessions, setServerSessions] = useState<FocusSessionItem[]>([]);

  // App Inspector Modal State
  const [inspectorApp, setInspectorApp] = useState<AppTelemetry | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<FocusSessionItem | null>(null);

  // Live Pulsating Micro Sparkline Equalizer Heights
  const [sparklineHeights, setSparklineHeights] = useState<number[]>([
    30, 45, 60, 40, 75, 90, 85, 70, 95, 80, 65, 85, 90, 100, 85
  ]);

  // Navigation & View States
  const [activeDockTab, setActiveDockTab] = useState<DockTab>("overview");
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(true);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<string | null>("VS Code");
  const [chartDayOffset, setChartDayOffset] = useState<number>(0);
  const [timelineFilter, setTimelineFilter] = useState<"daily" | "monthly" | "yearly">("daily");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<number>(new Date().getMonth());
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<number>(new Date().getFullYear());

  // Interactive Focus Dial Timer States
  const [activeSessionRunning, setActiveSessionRunning] = useState<boolean>(false);
  const [sprintDuration, setSprintDuration] = useState<number>(25); // 15, 25, 45, 60, 90 mins
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [activeAppFilter, setActiveAppFilter] = useState<string>("all");
  const [showFilterPopover, setShowFilterPopover] = useState<boolean>(false);
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [sprintCompleteBanner, setSprintCompleteBanner] = useState<{ title?: string; body?: string; category: string; minutes: number } | null>(null);

  // Ambient Soundscapes Engine States
  const [focusAudioMode, setFocusAudioMode] = useState<boolean>(false);
  const [audioPreset, setAudioPreset] = useState<"brown" | "binaural" | "rain">("brown");
  const [audioVolume, setAudioVolume] = useState<number>(65);
  const [showAudioPopover, setShowAudioPopover] = useState<boolean>(false);

  // Privacy & Governance States
  const [trackingEngineActive, setTrackingEngineActive] = useState<boolean>(true);
  const [localVaultEncryption, setLocalVaultEncryption] = useState<boolean>(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState<boolean>(true);
  const [aiClassificationEnabled, setAiClassificationEnabled] = useState<boolean>(true);
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
  const [newGoalCategory, setNewGoalCategory] = useState<string>("Coding & Dev");
  const [newGoalDate, setNewGoalDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newGoalStartTime, setNewGoalStartTime] = useState<string>("09:00");
  const [newGoalTargetHours, setNewGoalTargetHours] = useState<number>(0.4166); // default 25m focus sprint
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [activeFocusTask, setActiveFocusTask] = useState<TaskItem | null>(null);
  const [taskToast, setTaskToast] = useState<{ task: TaskItem; durationMinutes: number } | null>(null);


  // Precise duration formatter (e.g. 15m, 25m, 45m, 1h, 1h 30m, 2h 15m)
  const formatTimePrecise = (hours: number) => {
    const totalMinutes = Math.max(0, Math.round((hours || 0) * 60));
    if (totalMinutes === 0) return "0m";
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Helper to parse date and time strings accurately into local ISO format
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
          // DD/MM/YYYY
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
    return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  };

  // Task scheduled date & time formatter
  const formatTaskDateTime = (dateStr?: string, timeStr?: string) => {
    let datePart = "Today";
    if (dateStr) {
      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      if (dateStr === todayStr) datePart = "Today";
      else if (dateStr === tomorrowStr) datePart = "Tomorrow";
      else {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!isNaN(d.getTime())) {
            datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } else {
            datePart = dateStr;
          }
        }
      }
    }
    if (timeStr) {
      return `${datePart}, ${timeStr}`;
    }
    return datePart;
  };

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
    router.push("/login");
    logout();
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
      } catch (err) { }
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

  // Classify any uncategorized app via the backend API (Tier 1 heuristics → TF-IDF → Gemini)
  const classifyUnknownApps = (apps: string[]) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    apps.forEach(appName => {
      if (appCategoryMap[appName] || pendingClassificationRef.current.has(appName)) return; // already classified or pending
      pendingClassificationRef.current.add(appName);

      fetch(`${API_BASE}/analytics/classify-app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ raw_name: appName }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.category) {
            setAppCategoryMap(prev => ({ ...prev, [appName]: data.category }));
          }
        })
        .catch(() => { });
    });
  };

  // Fetch Tasks & Analytics Summary from FastAPI Backend
  const fetchAnalyticsSummary = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    if (!token) {
      setIsInitialDataLoading(false);
      return;
    }

    try {
      await Promise.all([
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
          }),
        fetch(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const mapped: TaskItem[] = data.map((t: any) => ({
                id: t.id,
                title: t.title,
                category: t.category || "Coding & Dev",
                spentHours: t.spent_hours || 0,
                targetHours: t.target_hours || 0.4166,
                completed: t.completed,
                scheduledDate: t.scheduled_date || (t.created_at ? t.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
                startTime: t.start_time || "09:00"
              }));
              setTaskList(mapped);
            }
          }),
        fetch(`${API_BASE}/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (Array.isArray(data)) {
              setServerSessions(data);
            }
          })
      ]);
    } catch (e) {
    } finally {
      setIsInitialDataLoading(false);
    }
  };

  // Synchronize Category Tracker Widget with User's Selected Disciplines (user.focus_fields)
  useEffect(() => {
    if (user?.focus_fields && user.focus_fields.length > 0) {
      const COLOR_PALETTES = [
        { badgeColor: "bg-cyan-100/90 text-cyan-900 border-cyan-300/50", progressColor: "bg-cyan-600" },
        { badgeColor: "bg-indigo-100/90 text-indigo-950 border-indigo-300/50", progressColor: "bg-indigo-500" },
        { badgeColor: "bg-emerald-100/90 text-emerald-950 border-emerald-300/50", progressColor: "bg-emerald-600" },
        { badgeColor: "bg-amber-100/90 text-amber-950 border-amber-300/50", progressColor: "bg-amber-600" },
        { badgeColor: "bg-purple-100/90 text-purple-950 border-purple-300/50", progressColor: "bg-purple-600" },
        { badgeColor: "bg-slate-200/80 text-slate-700 border-slate-300/50", progressColor: "bg-slate-600" },
      ];

      const userCategories: CategoryTrack[] = user.focus_fields.map((fieldName, idx) => {
        const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
        return {
          id: fieldName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: fieldName,
          targetHours: 3.0,
          spentHours: 0.0,
          badgeColor: palette.badgeColor,
          progressColor: palette.progressColor,
        };
      });

      setCategories(userCategories);
      if (userCategories.length > 0) {
        setActiveCategory(userCategories[0].name);
        setExpandedCategory(userCategories[0].name);
      }
    }
  }, [user?.focus_fields]);

  useEffect(() => {
    fetchAnalyticsSummary();

    // Request browser notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Listen for Realtime macOS System Application Telemetry from Electron
    if (typeof window !== "undefined" && (window as any).electronAPI?.onRealtimeActivityTelemetry) {
      (window as any).electronAPI.onRealtimeActivityTelemetry((data: any) => {
        if (data?.activeApp) {
          setSelectedApp(data.activeApp);
          if (data.category) {
            setActiveCategory(data.category);
            setExpandedCategory(data.category);
            setAppCategoryMap(prev => ({ ...prev, [data.activeApp]: data.category }));
          }
          if (data.appPercentages) {
            setAppPctMap(data.appPercentages);
            // Classify any new apps that appeared without a category
            const unknowns = Object.keys(data.appPercentages).filter(
              (a: string) => !data.category || !appCategoryMap[a]
            );
            if (unknowns.length > 0) classifyUnknownApps(unknowns);
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
      setTimerSeconds(sprintDuration * 60);

      // Show toast if sprint was launched for a specific task
      if (activeFocusTask) {
        setTaskToast({
          task: activeFocusTask,
          durationMinutes: sprintDuration
        });
      } else {
        // Show in-app completion banner (always works)
        setSprintCompleteBanner({
          title: "Focus Sprint Completed",
          body: `Great job! Your ${sprintDuration}-minute ${activeCategory} session is finished. Time for a short break!`,
          category: activeCategory,
          minutes: sprintDuration
        });
        setTimeout(() => setSprintCompleteBanner(null), 10000);
      }

      // Trigger Native macOS / Electron Notification
      if (typeof window !== "undefined") {
        if ((window as any).electronAPI?.sendTimerCompletedNotification) {
          (window as any).electronAPI.sendTimerCompletedNotification({
            category: activeCategory,
            durationMinutes: sprintDuration
          });
        } else if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Focus Sprint Completed", {
            body: `Great job! Your ${sprintDuration}-minute ${activeCategory} session is finished. Time for a short break!`
          });
        }
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
      if (token && !activeFocusTask) {
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
          .catch(() => { });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSessionRunning, timerSeconds, sprintDuration, selectedApp, activeCategory]);


  // Realtime Scheduled Tasks Clock Monitor:
  // Shows a toast notification (not a modal) when a scheduled task's time has elapsed.
  useEffect(() => {
    const checkScheduledTasks = () => {
      if (taskToast) return;

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Load persisted prompted IDs from localStorage
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
          const [hStr, mStr] = task.startTime.split(":");
          const startH = parseInt(hStr, 10);
          const startM = parseInt(mStr, 10);
          if (!isNaN(startH) && !isNaN(startM)) {
            const durationMinutes = Math.max(1, Math.round((task.targetHours || 0.4166) * 60));
            if (currentMinutes >= startH * 60 + startM + durationMinutes) {
              // Persist so this task won't prompt again
              persistedPrompted.add(String(task.id));
              try { localStorage.setItem("vita_prompted_task_ids", JSON.stringify([...persistedPrompted])); } catch {}

              setTaskToast({ task, durationMinutes });

              if (typeof window !== "undefined") {
                if ((window as any).electronAPI?.sendTimerCompletedNotification) {
                  (window as any).electronAPI.sendTimerCompletedNotification({ category: task.category, durationMinutes });
                } else if ("Notification" in window && Notification.permission === "granted") {
                  new Notification("Focus Time Finished! 🎯", { body: `"${task.title}" — did you complete it?` });
                }
              }
              break;
            }
          }
        }
      }
    };

    checkScheduledTasks();
    const interval = setInterval(checkScheduledTasks, 3000);
    return () => clearInterval(interval);
  }, [taskList, taskToast]);


  // Sync Live Timer Status with macOS Menu Bar / Tray
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.updateTimerStatus) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      (window as any).electronAPI.updateTimerStatus({
        timerFormatted: formatted,
        activeSessionRunning,
        category: activeCategory
      });
    }
  }, [timerSeconds, activeSessionRunning, activeCategory]);

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
        try { sourceNode.stop(); } catch { }
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch { }
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

    const chosenCategory = newGoalCategory || (categories.length > 0 ? categories[0].name : "Coding & Dev");
    const chosenHours = newGoalTargetHours || 0.4166;
    const chosenDate = newGoalDate || new Date().toISOString().split("T")[0];
    const chosenStartTime = newGoalStartTime || "09:00";

    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    let createdTask: TaskItem = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      category: chosenCategory,
      spentHours: 0,
      targetHours: chosenHours,
      completed: false,
      scheduledDate: chosenDate,
      startTime: chosenStartTime
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
            title: newGoalTitle.trim(),
            category: chosenCategory,
            target_hours: chosenHours,
            scheduled_date: chosenDate,
            start_time: chosenStartTime
          })
        });
        if (res.ok) {
          const data = await res.json();
          createdTask = {
            id: data.id,
            title: data.title,
            category: data.category || chosenCategory,
            spentHours: data.spent_hours || 0,
            targetHours: data.target_hours || chosenHours,
            completed: data.completed || false,
            scheduledDate: data.scheduled_date || chosenDate,
            startTime: data.start_time || chosenStartTime
          };
          fetchAnalyticsSummary();
        }
      } catch { }
    }

    setTaskList([createdTask, ...taskList]);
    setNewGoalTitle("");
  };

  // Resolve Task Sprint Completion & Calendar Session Logging
  const handleResolveTaskSprint = async (task: TaskItem, durationMinutes: number, wasCompleted: boolean) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    const addedHours = durationMinutes / 60;
    const newSpentHours = (task.spentHours || 0) + addedHours;

    setTaskList(prev => prev.map(t => t.id === task.id ? { ...t, spentHours: newSpentHours, completed: wasCompleted } : t));
    setActiveFocusTask(null);
    setTaskToast(null);
    // Also persist to localStorage so the task won't re-prompt on next visit
    try {
      const raw = localStorage.getItem("vita_prompted_task_ids");
      const persisted: Set<string> = raw ? new Set(JSON.parse(raw)) : new Set();
      persisted.add(String(task.id));
      localStorage.setItem("vita_prompted_task_ids", JSON.stringify([...persisted]));
    } catch {}

    // Build exact session timestamp so it plots accurately on the Daily/Monthly Calendar
    const sessionTimestamp = parseTaskDateAndTimeToIso(task.scheduledDate, task.startTime);

    // If completed before target time elapsed (during the scheduled window), calculate exact elapsed duration
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
        // 1. Update task in backend: If still working, ensure completed stays False
        await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            spent_hours: newSpentHours,
            completed: wasCompleted ? true : false
          })
        });

        // 2. Log finished focus session to Calendar backend (/sessions) with actual task title and exact elapsed duration
        await fetch(`${API_BASE}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            duration_minutes: finalDurationMinutes,
            efficiency_score: wasCompleted ? 95 : 85,
            app_name: task.title || selectedApp || "Focus Session",
            category: task.category,
            created_at: sessionTimestamp
          })
        });

        // 3. Refresh analytics and calendar timeline
        await fetchAnalyticsSummary();
      } catch (e) {
        console.error("Failed to sync task sprint resolution", e);
      }
    }

    if (wasCompleted) {
      setSprintCompleteBanner({
        title: "Task Completed & Logged! 🎉",
        body: `"${task.title}" marked complete and synced to your Focus Calendar!`,
        category: task.category,
        minutes: durationMinutes
      });
      setTimeout(() => setSprintCompleteBanner(null), 8000);
    } else {
      setSprintCompleteBanner({
        title: "Activity Logged to Calendar 📅",
        body: `${durationMinutes}m logged on "${task.title}". Task remains active until manually completed.`,
        category: task.category,
        minutes: durationMinutes
      });
      setTimeout(() => setSprintCompleteBanner(null), 6000);
    }
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

        // If newly checked as completed, sync session to calendar
        if (nextCompleted) {
          const sessionTimestamp = parseTaskDateAndTimeToIso(target.scheduledDate, target.startTime);
          const startDate = new Date(sessionTimestamp);
          const now = new Date();
          const targetMinutes = Math.max(1, Math.round((target.targetHours || 0.4166) * 60));

          let durMinutes = targetMinutes;
          // Only if completion occurred during the active scheduled window, compute elapsed minutes
          const scheduledEndMs = startDate.getTime() + targetMinutes * 60000;
          if (!isNaN(startDate.getTime()) && now.getTime() > startDate.getTime() && now.getTime() < scheduledEndMs) {
            const elapsed = Math.round((now.getTime() - startDate.getTime()) / 60000);
            if (elapsed > 0 && elapsed < targetMinutes) {
              durMinutes = Math.max(1, elapsed);
            }
          }

          await fetch(`${API_BASE}/sessions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              duration_minutes: durMinutes,
              efficiency_score: 95,
              app_name: target.title,
              category: target.category,
              created_at: sessionTimestamp
            })
          });
        }
        fetchAnalyticsSummary();
      } catch { }
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTaskList(taskList.filter(t => t.id !== id));
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    if (token) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAnalyticsSummary();
      } catch { }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setServerSessions(prev => prev.filter(s => s.id !== sessionId));
    const token = typeof window !== "undefined" ? localStorage.getItem("vita_token") : null;
    if (token) {
      try {
        await fetch(`${API_BASE}/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAnalyticsSummary();
      } catch (e) {
        console.error("Failed to delete session", e);
      }
    }
  };

  if (isInitialDataLoading) {
    return <TypewriterSessionLoader />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e4e7e4] text-slate-800 font-sans select-none antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-8">

      {/* Sprint Completion & Focus Alert In-App Banner */}
      {sprintCompleteBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-page-entrance">
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center space-x-4 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{sprintCompleteBanner.title || "Focus Sprint Completed!"}</span>
              <span className="text-xs text-slate-300">
                {sprintCompleteBanner.body || `Great job! Your ${sprintCompleteBanner.minutes}-minute ${sprintCompleteBanner.category} session is finished. Time for a short break!`}
              </span>
            </div>
            <button
              onClick={() => setSprintCompleteBanner(null)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </div>
      )}

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

        {/* Center Header Column */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          {activeDockTab === "overview" ? (
            <>
              {/* Metric 1: Daily Focus */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Daily Focus</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                    {dailyFocusHours.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">hrs</span>
                </div>
              </div>

              {/* Metric 2: Weekly Focus */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-normal text-slate-400 tracking-wide uppercase">Weekly Focus</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900 font-sans">
                    {weeklyFocusHours.toFixed(1)}
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
            </>
          ) : activeDockTab === "calendar" ? (
            /* Integrated Scope Selector Pills directly in Header Center */
            <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-2xs">
              <button
                onClick={() => setTimelineFilter("daily")}
                className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${timelineFilter === "daily" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimelineFilter("monthly")}
                className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${timelineFilter === "monthly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimelineFilter("yearly")}
                className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer ${timelineFilter === "yearly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Yearly
              </button>
            </div>
          ) : activeDockTab === "tasks" ? (
            /* Integrated Task Status Selector Pills directly in Header Center */
            <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-2xs">
              {(["all", "active", "completed"] as const).map((tab) => {
                const count = tab === "all" ? taskList.length : tab === "active" ? taskList.filter(t => !t.completed).length : taskList.filter(t => t.completed).length;
                const isActive = taskStatusFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setTaskStatusFilter(tab)}
                    className={`px-5 py-1.5 text-xs font-medium rounded-full transition cursor-pointer capitalize ${isActive ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Right Header Column (Matches Right Drawer Width w-72 lg:w-80) */}
        <div className="w-72 lg:w-80 flex items-center justify-end space-x-2 shrink-0">

          {/* Action Button: Focus Alerts & Notifications */}
          <button
            onClick={() => {
              const nextState = !notificationActive;
              setNotificationActive(nextState);
              if (nextState) {
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
                  Notification.requestPermission();
                }
                setSprintCompleteBanner({
                  title: "Notifications & Break Alerts Active",
                  body: "Vita alert banners and macOS system notifications are active.",
                  category: activeCategory,
                  minutes: sprintDuration
                });
                setTimeout(() => setSprintCompleteBanner(null), 5000);
              } else {
                setSprintCompleteBanner(null);
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${notificationActive ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"}`}
            title="Toggle Focus Break Alerts & Distraction Shield Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* User Profile & Account Menu */}
          <div ref={userMenuRef} className="relative ml-2">
            {/* User Account Avatar Node */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden text-white font-medium flex items-center justify-center shadow-xs hover:ring-2 hover:ring-slate-400 transition cursor-pointer hover:scale-105 active:scale-95 shrink-0 border border-white/40"
              title="User Account & Authentication Menu"
            >
              {user?.avatar_url && user.avatar_url.startsWith("data:image") ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:emerald") ? (
                <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:indigo") ? (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-800 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:amber") ? (
                <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:obsidian") ? (
                <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </div>
              ) : user?.avatar_url && user.avatar_url.startsWith("preset:cyan") ? (
                <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
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
                  {user?.focus_fields && user.focus_fields.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.focus_fields.map((field, idx) => (
                        <span key={idx} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {field}
                        </span>
                      ))}
                    </div>
                  )}
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
      <div className="flex-1 flex space-x-6 min-h-0 overflow-hidden relative animate-page-entrance">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Total Focus Time Gauge + Active Focus Sessions (Home Only) */}
        {/* ----------------------------------------------------------------------- */}
        {activeDockTab === "overview" && (
          <aside className="w-72 lg:w-80 flex flex-col space-y-3 shrink-0 overflow-y-auto pr-1 pb-20">

            {/* Top Card: Total Focus Time Gauge */}
            <div className="bg-[#dcdfdc]/80 rounded-3xl p-5 border border-white/60 shadow-xs flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-md shrink-0 space-y-2">
              {/* Top Row: Clean Header Label + Target Badge */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Focus Goal</span>
                <span className="text-[10px] font-medium text-slate-700 bg-white/60 px-2 py-0.5 rounded-full border border-white/60 shadow-2xs font-mono">
                  7.0h Target
                </span>
              </div>

              {/* Main Metric Display */}
              <div className="text-center pt-0.5">
                <div className="text-4xl font-light text-slate-900 tracking-tight font-sans">
                  {totalFocusHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">hrs</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Total Tracked Today</span>
              </div>

              {/* Sleek Semi-Circle Arc Gauge */}
              {(() => {
                const targetPct = Math.min(100, Math.round((dailyFocusHours / 7.0) * 100));
                const needleRad = Math.PI * (1 - targetPct / 100);
                const needleX = (50 + 38 * Math.cos(needleRad)).toFixed(2);
                const needleY = (50 - 38 * Math.sin(needleRad)).toFixed(2);

                return (
                  <div className="relative w-44 h-22 mt-1 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 55">
                      {/* Background Semi-Circle Arc Track */}
                      <path
                        d="M 12 50 A 38 38 0 0 1 88 50"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 12 50 A 38 38 0 0 1 88 50"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="1.5 3.5"
                      />

                      {/* Progress Arc Fill */}
                      {targetPct > 0 && (
                        <path
                          d={`M 12 50 A 38 38 0 0 1 ${needleX} ${needleY}`}
                          fill="none"
                          stroke="#181a1b"
                          strokeWidth="5.5"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Progress Indicator Node */}
                      <circle
                        cx={targetPct > 0 ? needleX : "12"}
                        cy={targetPct > 0 ? needleY : "50"}
                        r="4.5"
                        fill="#181a1b"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Center Progress Percentage Badge */}
                    <div className="absolute bottom-0 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-800 font-mono">{targetPct}% Completed</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* DYNAMIC REAL-TIME & INTERACTIVE CATEGORY SESSION TRACKS */}
            <div className="space-y-2.5 pb-6">
              {categories.map((cat) => {
                const isExpanded = expandedCategory === cat.name;
                const isActive = activeCategory === cat.name;
                const calcPct = Math.min(100, Math.round((cat.spentHours / cat.targetHours) * 100));

                // Map Category Name to Lucide Icon
                const CategoryIcon = (() => {
                  if (cat.name.includes("Coding") || cat.name.includes("Dev")) return Code2;
                  if (cat.name.includes("Design") || cat.name.includes("UI")) return Palette;
                  if (cat.name.includes("Research") || cat.name.includes("Reading")) return BookOpen;
                  if (cat.name.includes("Writing") || cat.name.includes("Docs")) return FileText;
                  if (cat.name.includes("Data") || cat.name.includes("Analytics")) return BarChart3;
                  return Briefcase;
                })();

                if (isExpanded) {
                  // EXPANDED CATEGORY CARD: ANIMATED FAR-LEFT ICON & NO CHEVRON ARROW
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setExpandedCategory(null)}
                      className="bg-[#dcdfdc]/90 rounded-3xl p-5 border border-white/60 shadow-xs space-y-4 transition-all duration-300 cursor-pointer"
                    >
                      {/* Header Row: Animated Far-Left Icon + Name + Hours + Settings */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all ${isActive && activeSessionRunning
                              ? "bg-[#181a1b] text-cyan-300 animate-pulse ring-2 ring-cyan-400/40 shadow-xs"
                              : "bg-white/50 text-slate-700"
                              }`}
                          >
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-900 font-semibold text-xs whitespace-nowrap">{cat.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({cat.spentHours.toFixed(1)}h / {cat.targetHours}h)</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettingsModalCategory(cat);
                              setTempTargetHours(cat.targetHours);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 transition cursor-pointer"
                            title="Target Goal Settings"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Category Efficiency Metric Display */}
                      {(() => {
                        const categoryWeights: Record<string, number> = {
                          "Coding & Dev": 95,
                          "Design & UI": 90,
                          "Research & Docs": 84,
                          "Reading & Research": 86,
                          "Writing & Docs": 88,
                          "Data & Analytics": 92,
                          "Product & Strategy": 82,
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
                            <span className="text-[11px] text-slate-400 font-medium tracking-wide">Category Efficiency</span>
                            <div className="text-3xl font-light text-slate-900 tracking-tight mt-0.5 font-sans">
                              {categoryEfficiency} <span className="text-sm font-normal text-slate-400">%</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Equalizer Sparkline Spectrum Bars (Muted Low-Color Tones) */}
                      <div className="h-5 flex items-end space-x-1 px-1">
                        {sparklineHeights.map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-xs transition-all duration-300 ${isActive && activeSessionRunning
                              ? "bg-slate-800"
                              : "bg-slate-300/80"
                              }`}
                            style={{ height: isActive && activeSessionRunning ? `${h}%` : "30%" }}
                          />
                        ))}
                      </div>

                      {/* Primary Action Button: Start / Pause Session */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isActive) {
                            setActiveCategory(cat.name);
                            if (timerSeconds === 0) setTimerSeconds(sprintDuration * 60);
                            setActiveSessionRunning(true);
                          } else {
                            if (timerSeconds === 0) {
                              setTimerSeconds(sprintDuration * 60);
                              setActiveSessionRunning(true);
                            } else {
                              setActiveSessionRunning(!activeSessionRunning);
                            }
                          }
                        }}
                        className="w-full h-11 rounded-full bg-[#181a1b] hover:bg-slate-900 text-white text-xs font-medium flex items-center justify-between px-5 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
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

                // COLLAPSED CATEGORY ROW: ANIMATED FAR-LEFT ICON & NO CHEVRON ARROW
                return (
                  <div
                    key={cat.id}
                    onClick={() => setExpandedCategory(cat.name)}
                    className="bg-[#dcdfdc]/70 hover:bg-[#dcdfdc]/90 rounded-2xl p-4 border border-white/40 shadow-xs flex items-center justify-between text-xs transition-all duration-200 cursor-pointer"
                    title={`Click to Expand ${cat.name} Category Telemetry`}
                  >
                    <div className="flex items-center space-x-3 flex-1 mr-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive && activeSessionRunning
                          ? "bg-[#181a1b] text-cyan-300 animate-pulse shadow-xs"
                          : "bg-white/50 text-slate-700"
                          }`}
                      >
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-900 font-semibold text-xs whitespace-nowrap">
                        {cat.name}
                      </span>

                      {/* Progress Bar Track */}
                      <div className="flex-1 h-1 bg-slate-300/70 rounded-full overflow-hidden min-w-8">
                        <div className={`h-full ${cat.progressColor} transition-all duration-500 rounded-full`} style={{ width: `${calcPct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {cat.spentHours.toFixed(1)}h / {cat.targetHours}h
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSettingsModalCategory(cat);
                          setTempTargetHours(cat.targetHours);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900 transition cursor-pointer"
                        title="Target Goal Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </aside>
        )}

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
            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 relative">

              {/* Central Canvas with Safe Orbital Perimeter Positions for App Nodes */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-visible">

                {/* PURE DYNAMIC ORBITAL APPLICATION BUBBLE NODES (BASED ON REAL TRACKED SYSTEM APPS) */}
                {(() => {
                  // Deterministic pseudo-random string hash for organic distribution
                  const getAppHash = (str: string) => {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                      hash = (hash << 5) - hash + str.charCodeAt(i);
                      hash |= 0;
                    }
                    return Math.abs(hash);
                  };

                  // Dynamic organic layout with usage-based bubble scaling
                  const computeNodeStyle = (appName: string, idx: number, pct: number): React.CSSProperties => {
                    const hash = getAppHash(appName);

                    // Golden-angle scattering combined with app hash for pseudo-random organic positions around dial
                    const angleDeg = (hash + idx * 137.5) % 360;
                    const angleRad = (angleDeg * Math.PI) / 180;

                    // Pseudo-random radial variance from center (34% - 48%)
                    const rx = 36 + (hash % 12);
                    const ry = 34 + ((hash >> 3) % 12);

                    const cx = 50;
                    const cy = 50;
                    const x = cx + rx * Math.cos(angleRad);
                    const y = cy + ry * Math.sin(angleRad);

                    // Dynamic sizing based on usage percentage (48px for light use up to 98px for high use)
                    const baseSize = 48;
                    const scaleFactor = Math.min(50, Math.pow(pct / 100, 0.5) * 50);
                    const size = Math.round(baseSize + scaleFactor);

                    return {
                      position: "absolute",
                      left: `calc(${x}% - ${size / 2}px)`,
                      top: `calc(${y}% - ${size / 2}px)`,
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDelay: `${(hash % 200) + 40}ms`,
                    };
                  };

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

                  // Show all apps, capped at 16 for visual clarity
                  const visibleApps = activeApps.slice(0, 16);
                  return visibleApps.map((appName, idx) => {
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
                          // Use API-classified category (filled in by classifyUnknownApps)
                          const cat = appCategoryMap[appName] || APP_TELEMETRY_DATA[appName]?.category || "Classifying…";
                          const stat = APP_TELEMETRY_DATA[appName]?.status || "Active System Tracking";

                          setInspectorApp({
                            name: appName,
                            category: cat,
                            spentFormatted: formatSpent(seconds),
                            pct: pct,
                            status: stat
                          });
                        }}
                        style={computeNodeStyle(appName, idx, pct)}
                        className={`rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${isSelected ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/90 border-white/80 shadow-2xs hover:bg-white"}`}
                        title={`Click to Inspect ${appName} Activity Telemetry`}
                      >
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-light font-mono">{pct} %</span>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-800 mt-0.5 truncate max-w-[80%] text-center">{appName}</span>
                      </div>
                    );
                  });
                })()}

                {/* MAIN CENTRAL FOCUS DIAL WIDGET */}
                <div className="relative flex items-center justify-center">

                  <div
                    onClick={() => {
                      if (timerSeconds === 0) {
                        setTimerSeconds(sprintDuration * 60);
                        setActiveSessionRunning(true);
                      } else {
                        setActiveSessionRunning(!activeSessionRunning);
                      }
                    }}
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
                            { id: "Reading & Research", label: "Reading & Research" },
                            { id: "Writing & Docs", label: "Writing & Docs" },
                            { id: "Data & Analytics", label: "Data & Analytics" },
                            { id: "Product & Strategy", label: "Product & Strategy" }
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
                              <span>Brown Noise (Deep Focus)</span>
                              {audioPreset === "brown" && focusAudioMode && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                            </button>

                            <button
                              onClick={() => { setAudioPreset("binaural"); setFocusAudioMode(true); }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${audioPreset === "binaural" && focusAudioMode ? "bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200" : "hover:bg-slate-100 text-slate-700"}`}
                            >
                              <span>Binaural 40Hz (Gamma Flow)</span>
                              {audioPreset === "binaural" && focusAudioMode && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>

                            <button
                              onClick={() => { setAudioPreset("rain"); setFocusAudioMode(true); }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${audioPreset === "rain" && focusAudioMode ? "bg-sky-50 text-sky-900 font-semibold border border-sky-200" : "hover:bg-slate-100 text-slate-700"}`}
                            >
                              <span>Deep Rain Soundscape</span>
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

          {/* VIEW 2: CALENDAR (Scope-Driven Timeline Calendar: Daily, Monthly, Yearly) */}
          {activeDockTab === "calendar" && (
            <div className="max-w-6xl w-full mx-auto h-full flex flex-col min-h-0 space-y-4 p-2 sm:p-4 pb-20 animate-page-entrance overflow-hidden">

              {timelineFilter === "daily" ? (
                /* SCOPE 1: DAILY 24-HOUR TIMELINE GRID */
                <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-hidden">
                  {/* Top 7-Day Day Selector Strip */}
                  <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-3xl border border-white/70 shadow-xs space-y-2.5 shrink-0">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-700" />
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
                        // Compute Monday of the week for selectedCalendarDate
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

                          // Calculate real focus hours from backend serverSessions
                          const daySessions = serverSessions.filter(s => {
                            if (!s.created_at) return false;
                            return new Date(s.created_at).toDateString() === d.toDateString();
                          });

                          const totalHours = daySessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (isToday ? (dailyFocusHours || 0) : 0);

                          return {
                            dateObj: d,
                            day: d.toLocaleDateString("en-US", { weekday: "short" }),
                            date: d.getDate().toString(),
                            hrs: totalHours,
                            active: isSelected,
                            isToday,
                            isFuture,
                            sessionCount: daySessions.length
                          };
                        });

                        return days.map((d) => (
                          <div
                            key={d.day + d.date}
                            onClick={d.isFuture ? undefined : () => setSelectedCalendarDate(d.dateObj)}
                            className={`p-2.5 rounded-2xl flex flex-col items-center justify-between h-18 border transition select-none ${d.isFuture
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

                  {/* 24-Hour Chronological Timeline Feed (Card with Internal Scrolling Only) */}
                  <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden">
                    {(() => {
                      const isSelectedToday = selectedCalendarDate.toDateString() === new Date().toDateString();
                      const daySessions = serverSessions.filter(s => {
                        if (!s.created_at) return isSelectedToday;
                        return new Date(s.created_at).toDateString() === selectedCalendarDate.toDateString();
                      });

                      const selectedDayHours = daySessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (isSelectedToday ? (dailyFocusHours || 0) : 0);
                      const blockCount = daySessions.length || (isSelectedToday && selectedDayHours > 0 ? (serverSessions.length || 1) : 0);

                      return (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 shrink-0 mb-3">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">24-Hour Daily Timeline Schedule</h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {selectedCalendarDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} • {selectedDayHours.toFixed(1)} hrs tracked
                              </p>
                            </div>
                            <span className="text-xs font-mono text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                              {blockCount} Focus Blocks
                            </span>
                          </div>

                          {/* Continuous 24-Hour Timeline Grid View */}
                          <div className="flex-1 min-h-0 overflow-y-auto pr-2 relative">
                            {(() => {
                              const HOUR_HEIGHT = 84; // 84px per hour = 1.4px per minute
                              const minToPx = HOUR_HEIGHT / 60;
                              const MIN_CARD_HEIGHT = 56;
                              const VERTICAL_GAP = 5;

                              // Parse and sort all sessions with visual geometry bounds
                              const parsed = daySessions.map(s => {
                                const sDate = s.created_at ? new Date(s.created_at) : new Date();
                                const startMin = sDate.getHours() * 60 + sDate.getMinutes();
                                const dur = Math.max(1, s.duration_minutes || 25);
                                const endMin = startMin + dur;
                                const topPx = startMin * minToPx;
                                const heightPx = Math.max(MIN_CARD_HEIGHT, dur * minToPx);
                                const visualBottomPx = topPx + heightPx;
                                return { session: s, sDate, startMin, endMin, duration: dur, topPx, heightPx, visualBottomPx };
                              }).sort((a, b) => a.topPx - b.topPx || b.duration - a.duration);

                              // Cluster overlapping sessions based on visual bounding collisions
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

                              // Multi-column graph allocation (Allows unlimited horizontal lanes as needed)
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
                                    totalCols
                                  });
                                }
                              }

                              return (
                                <div className="relative h-[2016px] w-full flex">
                                  {/* Left Hour Markers (24 Hours: 12 AM to 11 PM) */}
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

                                  {/* Canvas Grid Area */}
                                  <div className="flex-1 relative border-l-2 border-slate-200">
                                    {/* Horizontal Guidelines for each hour */}
                                    {Array.from({ length: 24 }, (_, h) => (
                                      <div
                                        key={h}
                                        style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                        className="absolute left-0 right-0 border-t border-slate-200/60 pointer-events-none"
                                      >
                                        <div className="absolute -left-[5px] -top-[4px] w-2 h-2 rounded-full bg-slate-300" />
                                      </div>
                                    ))}

                                    {/* Positioned Activity Cards with Guaranteed Clean Non-overlapping Columns */}
                                    {positionedSessions.map((pos) => {
                                      const s = pos.session;
                                      const startTime = pos.sDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                      const endDate = new Date(pos.sDate.getTime() + pos.duration * 60000);
                                      const endTime = endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                                      const isPersonal = s.category?.toLowerCase().includes("health") || s.category?.toLowerCase().includes("gym") || s.category?.toLowerCase().includes("personal");
                                      const isAdmin = s.category?.toLowerCase().includes("admin") || s.category?.toLowerCase().includes("routine") || s.category?.toLowerCase().includes("mail");
                                      const matchedCat = categories.find(c => c.name === s.category || (s.category?.toLowerCase().includes("engineer") && c.name.toLowerCase().includes("coding")));

                                      const accentBorder = isPersonal 
                                        ? "border-l-4 border-l-rose-500" 
                                        : isAdmin 
                                          ? "border-l-4 border-l-teal-600" 
                                          : (matchedCat?.name === "Design & UI" ? "border-l-4 border-l-indigo-600" : "border-l-4 border-l-cyan-600");

                                      // Calculate width and horizontal offset with clean gutters
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
                                            width: `calc(${colWidthPct}% - 8px)`
                                          }}
                                          className={`absolute z-10 bg-white/95 hover:bg-white p-2.5 sm:p-3 rounded-xl border border-white/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${accentBorder}`}
                                        >
                                          {/* Card Header */}
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
                                                {Math.round(s.efficiency_score)}% Flow
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

                                          {/* Card Footer (Only shown if card has enough vertical height) */}
                                          {pos.heightPx >= 70 && (
                                            <div className="flex items-center justify-between text-xs pt-1 mt-1 border-t border-slate-100 text-slate-600 shrink-0">
                                              <span className="text-[10px] truncate mr-1">
                                                Category: <strong className="text-slate-800 font-medium">{s.category}</strong>
                                              </span>
                                              <span className="font-mono text-[9px] text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                                                {pos.duration}m
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* Empty State */}
                                    {daySessions.length === 0 && (
                                      <div className="absolute top-28 left-6 right-6 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 text-center space-y-1">
                                        <p className="text-xs font-semibold text-slate-700">No Tracked Focus Activity</p>
                                        <p className="text-[11px] text-slate-400">Complete tasks or run focus sprints to populate your 24-hour daily timeline.</p>
                                      </div>
                                    )}
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
                /* SCOPE 2: FULL 31-DAY MONTHLY CALENDAR GRID */
                <div className="flex-1 min-h-0 overflow-y-auto bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-xs space-y-6 pb-6">
                  {(() => {
                    const monthDate = new Date(selectedCalendarYear, selectedCalendarMonth, 1);
                    const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
                    const fullMonthName = monthDate.toLocaleDateString("en-US", { month: "long" });
                    const totalDays = new Date(selectedCalendarYear, selectedCalendarMonth + 1, 0).getDate();
                    const firstDayIndex = (new Date(selectedCalendarYear, selectedCalendarMonth, 1).getDay() + 6) % 7;

                    const isCurrentMonth = selectedCalendarMonth === new Date().getMonth() && selectedCalendarYear === new Date().getFullYear();

                    // Calculate real monthly focus hours from backend serverSessions
                    const monthSessions = serverSessions.filter(s => {
                      if (!s.created_at) return isCurrentMonth;
                      const d = new Date(s.created_at);
                      return d.getMonth() === selectedCalendarMonth && d.getFullYear() === selectedCalendarYear;
                    });

                    const monthTotalHours = monthSessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (isCurrentMonth ? (dailyFocusHours || 0.9) : 0);

                    return (
                      <>
                        {/* Month Navigation Header */}
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
                                    setSelectedCalendarYear(prev => prev - 1);
                                  } else {
                                    setSelectedCalendarMonth(prev => prev - 1);
                                  }
                                }}
                                className="px-2.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition"
                                title="Previous Month"
                              >
                                ←
                              </button>
                              <span className="text-xs font-semibold text-slate-800 px-2 min-w-[70px] text-center">{monthName} {selectedCalendarYear}</span>
                              <button
                                onClick={() => {
                                  if (selectedCalendarMonth === 11) {
                                    setSelectedCalendarMonth(0);
                                    setSelectedCalendarYear(prev => prev + 1);
                                  } else {
                                    setSelectedCalendarMonth(prev => prev + 1);
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

                        {/* 7-Column Monthly Days Header */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 pb-1">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>

                        {/* Month Grid Cells with Proper Day-of-Week Offsets */}
                        <div className="grid grid-cols-7 gap-2">
                          {/* Empty offset padding cells before day 1 */}
                          {Array.from({ length: firstDayIndex }, (_, i) => (
                            <div key={`pad-${i}`} className="min-h-[76px] rounded-2xl opacity-20 border border-dashed border-slate-300" />
                          ))}

                          {/* Real Days 1 to totalDays */}
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

                            // Filter backend sessions for this specific day
                            const daySessions = serverSessions.filter(s => {
                              if (!s.created_at) return isToday;
                              const d = new Date(s.created_at);
                              return d.getFullYear() === selectedCalendarYear && d.getMonth() === selectedCalendarMonth && d.getDate() === dayNum;
                            });

                            const hrs = daySessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (isToday ? (dailyFocusHours || 0.9) : 0);
                            const sessionCount = daySessions.length || (isToday && hrs > 0 ? (serverSessions.length || 2) : 0);

                            return (
                              <div
                                key={dayNum}
                                onClick={isFuture ? undefined : () => {
                                  setSelectedCalendarDate(cellDate);
                                  setTimelineFilter("daily");
                                }}
                                className={`min-h-[76px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all select-none ${isFuture
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
                <div className="flex-1 min-h-0 overflow-y-auto bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/70 shadow-xs space-y-6 pb-6">
                  {(() => {
                    const months = [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];

                    const annualSessions = serverSessions.filter(s => {
                      if (!s.created_at) return true;
                      return new Date(s.created_at).getFullYear() === selectedCalendarYear;
                    });

                    const annualTotalHours = annualSessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (dailyFocusHours || 0.9);

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

                        {/* 12 Months Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {months.map((monthName, mIdx) => {
                            const isCurrentMonth = mIdx === new Date().getMonth() && selectedCalendarYear === new Date().getFullYear();
                            const isFutureMonth = (selectedCalendarYear > new Date().getFullYear()) || (selectedCalendarYear === new Date().getFullYear() && mIdx > new Date().getMonth());

                            const mSessions = serverSessions.filter(s => {
                              if (!s.created_at) return isCurrentMonth;
                              const d = new Date(s.created_at);
                              return d.getFullYear() === selectedCalendarYear && d.getMonth() === mIdx;
                            });

                            const mHours = mSessions.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || (isCurrentMonth ? (dailyFocusHours || 0.9) : 0);
                            const mCount = mSessions.length || (isCurrentMonth && mHours > 0 ? (serverSessions.length || 2) : 0);
                            const mScore = mSessions.length > 0 ? Math.round(mSessions.reduce((acc, s) => acc + s.efficiency_score, 0) / mSessions.length) : (isCurrentMonth ? Math.round(focusScore || 83) : 0);

                            return (
                              <div
                                key={monthName}
                                onClick={isFutureMonth ? undefined : () => {
                                  setSelectedCalendarMonth(mIdx);
                                  setTimelineFilter("monthly");
                                }}
                                className={`p-4 rounded-2xl border space-y-3 transition-all select-none ${isFutureMonth
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

                                {/* Mini intensity bar */}
                                <div className={`h-1.5 rounded-full overflow-hidden ${isCurrentMonth ? "bg-slate-800" : "bg-slate-200/60"}`}>
                                  <div
                                    className={`h-full rounded-full ${isCurrentMonth ? "bg-cyan-400" : "bg-slate-800"}`}
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
          )}

          {/* VIEW 3: TASKS (Personal Goals & Task Queue) */}
          {activeDockTab === "tasks" && (
            <div className="max-w-6xl w-full mx-auto h-full flex flex-col min-h-0 space-y-4 p-2 sm:p-4 pb-20 animate-page-entrance overflow-hidden">
              {/* Main 2-Column Grid Layout - Spacious 8:4 / 9:3 ratio */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
                {/* Left Column: Task Creator + Filter + Task List (Spacious 8 or 9 cols) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-h-0 space-y-3 overflow-hidden">
                  {/* Modern Spacious Task Creator Card */}
                  <form onSubmit={handleAddGoal} className="bg-white/70 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/80 shadow-xs space-y-2.5 shrink-0">
                    {/* Top Row: Title Input + Add Task Button */}
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

                    {/* Bottom Row: Premium 3-Block Grid Meta Toolbar (Category, Schedule, Target) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2.5 border-t border-slate-200/60 text-xs">
                      {/* Block 1: Category Selector */}
                      <div className="sm:col-span-4 lg:col-span-3 flex items-center justify-between bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs relative transition">
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Category:</span>
                        <select
                          value={newGoalCategory}
                          onChange={(e) => setNewGoalCategory(e.target.value)}
                          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium appearance-none pl-2 pr-5 truncate"
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

                      {/* Block 2: Schedule (Date & Start Time) */}
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

                      {/* Block 3: Target Duration Presets */}
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
                            { label: "2h", val: 2.0 }
                          ].map((p) => {
                            const isSelected = Math.abs(newGoalTargetHours - p.val) < 0.01;
                            return (
                              <button
                                type="button"
                                key={p.label}
                                onClick={() => setNewGoalTargetHours(p.val)}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono transition cursor-pointer shrink-0 ${isSelected ? "bg-slate-900 text-white font-semibold shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                                  }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}

                          {/* Custom Minute Stepper (Supports Min 1 Minute) */}
                          <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 shrink-0">
                            <input
                              type="number"
                              min="1"
                              max="720"
                              step="1"
                              value={Math.round(newGoalTargetHours * 60)}
                              onChange={(e) => setNewGoalTargetHours(Math.max(1, parseInt(e.target.value) || 1) / 60)}
                              className="w-10 px-1 py-0.5 text-[10px] font-mono text-slate-800 bg-white border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-slate-800 shadow-2xs"
                              title="Custom Target Duration (Minutes, Min: 1m)"
                            />
                            <span className="text-[10px] font-mono text-slate-400">m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Discipline & Activity Quick-Filter Bar */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 shrink-0 no-scrollbar">
                    <button
                      onClick={() => setTaskCategoryFilter("all")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${taskCategoryFilter === "all" ? "bg-slate-800 text-white shadow-2xs" : "bg-white/60 text-slate-600 hover:bg-white border border-white"
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
                          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${isCatActive ? "bg-slate-900 text-white border-slate-900 shadow-2xs" : "bg-white/60 text-slate-700 border-white hover:bg-white"
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
                          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${isCatActive ? "bg-slate-900 text-white border-slate-900 shadow-2xs" : "bg-white/60 text-slate-700 border-white hover:bg-white"
                            }`}
                        >
                          {pCat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable Task List with Internal Scrolling */}
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar pb-4">
                    {(() => {
                      const filteredTasks = taskList.filter((task) => {
                        // Status Filter
                        if (taskStatusFilter === "active" && task.completed) return false;
                        if (taskStatusFilter === "completed" && !task.completed) return false;
                        // Category Filter
                        if (taskCategoryFilter !== "all") {
                          const matches = task.category === taskCategoryFilter || (task.category.toLowerCase().includes("engineer") && taskCategoryFilter.toLowerCase().includes("coding"));
                          if (!matches) return false;
                        }
                        return true;
                      });

                      if (filteredTasks.length === 0) {
                        return (
                          <div className="bg-white/50 p-8 rounded-3xl border border-white/60 text-center space-y-1">
                            <p className="text-xs text-slate-600 font-medium">No tasks found for this filter.</p>
                            <p className="text-[11px] text-slate-400">Add a new goal or activity above to start tracking progress.</p>
                          </div>
                        );
                      }

                      return filteredTasks.map((task) => {
                        // Match category palette
                        const matchedCat = categories.find(c => c.name === task.category || (task.category.toLowerCase().includes("engineer") && c.name.toLowerCase().includes("coding")));
                        const isPersonal = task.category.toLowerCase().includes("health") || task.category.toLowerCase().includes("gym") || task.category.toLowerCase().includes("personal");
                        const isAdmin = task.category.toLowerCase().includes("admin") || task.category.toLowerCase().includes("routine") || task.category.toLowerCase().includes("mail");

                        const badgeStyle = isPersonal
                          ? "bg-rose-100 text-rose-950 border-rose-200"
                          : isAdmin
                            ? "bg-teal-100 text-teal-950 border-teal-200"
                            : (matchedCat?.badgeColor || "bg-slate-100 text-slate-700 border-slate-200");

                        const progressColor = isPersonal
                          ? "bg-rose-500"
                          : isAdmin
                            ? "bg-teal-600"
                            : (matchedCat?.progressColor || "bg-cyan-600");

                        const progressPct = task.completed
                          ? 100
                          : Math.min(95, Math.round(((task.spentHours || 0) / (task.targetHours || 0.4166)) * 100));

                        return (
                          <div
                            key={task.id}
                            className={`bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs flex items-center justify-between transition-all hover:bg-white ${task.completed ? "opacity-60 bg-white/40" : ""
                              }`}
                          >
                            <div className="flex items-center space-x-3 flex-1 mr-3 min-w-0">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition cursor-pointer shrink-0 ${task.completed ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white text-transparent hover:border-slate-500"
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
                              {/* Progress Bar */}
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

                              {/* Start Focus Sprint Button — Only for Work/Focus Disciplines, NOT Personal or Routine activities */}
                              {!task.completed && !isPersonal && !isAdmin && (
                                <button
                                  onClick={() => {
                                    setActiveFocusTask(task);
                                    if (matchedCat) {
                                      setActiveCategory(matchedCat.name);
                                      setExpandedCategory(matchedCat.name);
                                    }
                                    const mins = Math.max(1, Math.round((task.targetHours || 0.4166) * 60));
                                    setSprintDuration(mins);
                                    setTimerSeconds(mins * 60);
                                    setActiveSessionRunning(true);
                                    setActiveDockTab("overview");
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium text-cyan-900 bg-cyan-100 hover:bg-cyan-200 rounded-xl border border-cyan-300 transition cursor-pointer hidden md:flex items-center space-x-1"
                                  title="Launch Focus Dial for this task"
                                >
                                  <Zap className="w-3 h-3 text-cyan-700" />
                                  <span>Focus</span>
                                </button>
                              )}

                              {/* Delete Task Button - Only icon turns red on hover */}
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
                      });
                    })()}
                  </div>
                </div>

                {/* Right Column: Ultra-Compact Goal Allocations & Progress Summary (Small 4 or 3 cols) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-0 overflow-hidden">
                  <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-xs flex flex-col min-h-0 max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-2 shrink-0">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-900">Allocations</h3>
                        <p className="text-[10px] text-slate-500">
                          {taskList.filter(t => t.completed).length} of {taskList.length} done ({taskList.length > 0 ? Math.round((taskList.filter(t => t.completed).length / taskList.length) * 100) : 0}%)
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs font-semibold">
                        {taskList.length} Tasks
                      </span>
                    </div>

                    {/* Compact Scrollable Category List */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 custom-scrollbar pb-1">
                      {[
                        ...categories,
                        { id: "personal_health", name: "Personal & Health", progressColor: "bg-rose-500", badgeColor: "bg-rose-100 text-rose-950 border-rose-200" },
                        { id: "admin_routine", name: "Admin & Routine", progressColor: "bg-teal-600", badgeColor: "bg-teal-100 text-teal-950 border-teal-200" }
                      ].map((cat) => {
                        const catTasks = taskList.filter(t => {
                          if (cat.name === "Personal & Health") {
                            return t.category.toLowerCase().includes("health") || t.category.toLowerCase().includes("gym") || t.category.toLowerCase().includes("personal");
                          }
                          if (cat.name === "Admin & Routine") {
                            return t.category.toLowerCase().includes("admin") || t.category.toLowerCase().includes("routine") || t.category.toLowerCase().includes("mail");
                          }
                          return t.category === cat.name || (t.category.toLowerCase().includes("engineer") && cat.name.toLowerCase().includes("coding"));
                        });

                        const completedCatTasks = catTasks.filter(t => t.completed).length;
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

                    {/* Integrated Mini Velocity Bar at Footer */}
                    <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
                      <span>Velocity:</span>
                      <span className="font-semibold text-slate-800">
                        {taskList.length > 0 ? `${Math.round((taskList.filter(t => t.completed).length / taskList.length) * 100)}% Complete` : "0% Complete"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TASK COMPLETION TOAST — slides in from bottom-right, no backdrop */}
          {taskToast && (
            <div className="fixed bottom-24 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">Focus Time Finished</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">{taskToast.task.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTaskToast(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleResolveTaskSprint(taskToast.task, taskToast.durationMinutes, false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Still Working
                </button>
                <button
                  onClick={() => handleResolveTaskSprint(taskToast.task, taskToast.durationMinutes, true)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 transition cursor-pointer"
                >
                  Yes, Done! ✓
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: ANALYTICS (Time Allocation & Trends) */}
          {activeDockTab === "analytics" && (
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

                    serverSessions.forEach(s => {
                      const secs = s.duration_minutes * 60;
                      const cat = s.category;
                      if (cat === "Coding & Dev" || cat === "Engineering") devSecs += secs;
                      else if (cat === "Design & UI" || cat === "Design") designSecs += secs;
                      else if (cat === "Writing & Docs" || cat === "Productivity") writingSecs += secs;
                      else if (cat === "Reading & Research" || cat === "Research") researchSecs += secs;
                      else if (cat === "Data & Analytics") dataSecs += secs;
                      else productSecs += secs;
                    });

                    Object.keys(appSecondsMap).forEach(app => {
                      const secs = appSecondsMap[app] || 0;
                      const cat = appCategoryMap[app] || APP_TELEMETRY_DATA[app]?.category || "Coding & Dev";
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

                      serverSessions.forEach(s => {
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
          )}

          {/* VIEW 5: INSIGHTS (AI Productivity Coach & Habits) */}
          {activeDockTab === "insights" && (
            <div className="max-w-6xl w-full mx-auto space-y-6 p-4 overflow-y-auto max-h-full pb-24 animate-page-entrance">
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs">
                <h2 className="text-base font-semibold text-slate-900">AI Productivity & Flow Insights</h2>
                <p className="text-xs text-slate-500 mt-0.5">Calibrated recommendations generated from your recent focus sessions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-400/30 p-5 rounded-3xl shadow-xs space-y-2 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-2 text-cyan-900">
                    <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse-subtle" />
                    <span className="text-xs font-semibold">Optimal Peak Focus Window Identified</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Your flow state efficiency score is currently <strong className="text-cyan-900">{focusScore > 0 ? Math.round(focusScore) : 80}%</strong>. Starting deep focus blocks in morning sessions maximizes project velocity across {categories[0]?.name || "Coding & Dev"}.
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-2 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold">Context Switch Reduction Tip</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Enabling <strong>Focus Audio Shield</strong> (Brown Noise or 40Hz Binaural Beats) during deep focus blocks increases task completion velocity by 34%.
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-2 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-2 text-indigo-900">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold">Discipline Balance Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    You have dedicated <strong>{categories[0]?.spentHours.toFixed(1) || "0.0"}h</strong> to {categories[0]?.name || "Coding & Dev"}. Allocating a 30m block to <strong>Writing & Docs</strong> preserves long-term project architecture clarity.
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs space-y-2 transition-all hover:shadow-md">
                  <div className="flex items-center space-x-2 text-emerald-900">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold">Vault Security & Privacy Standard</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Your focus activity logs are strictly classified on-device using local LaunchServices telemetry. No active window titles or private text are transmitted to external servers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS (Privacy Controls, Account & Data Governance) */}
          {activeDockTab === "settings" && (
            <div className="max-w-6xl w-full mx-auto space-y-6 p-4 overflow-y-auto max-h-full pb-24 animate-page-entrance">
              {/* Feedback Alert Toast Banner */}
              {settingsFeedbackMsg && (
                <div className="p-3.5 bg-cyan-100/90 border border-cyan-300 text-cyan-950 text-xs font-medium rounded-2xl flex items-center justify-between animate-fade-in shadow-2xs">
                  <span>{settingsFeedbackMsg}</span>
                  <button onClick={() => setSettingsFeedbackMsg(null)} className="text-cyan-800 hover:text-cyan-950 text-sm font-bold">✕</button>
                </div>
              )}

              {/* Header Title */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/70 shadow-xs">
                <h2 className="text-base font-semibold text-slate-900">Settings & Telemetry Vault Governance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage user credentials, local device telemetry controls, app exclusions, and data ownership</p>
              </div>

              {/* 2-Column Grid of 4 Settings Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Card 1: User Profile & Account */}
                <form onSubmit={handleSaveProfileSettings} className="bg-white/60 backdrop-blur-md p-5.5 rounded-3xl border border-white/70 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">User Profile & Account</span>
                        <span className="text-[11px] text-slate-500">Connected account details & credentials</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-semibold rounded-full border border-emerald-300">
                        Pro Active Account
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileNameInput}
                          onChange={(e) => setProfileNameInput(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileEmailInput}
                          onChange={(e) => setProfileEmailInput(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-4.5 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs cursor-pointer"
                    >
                      Save Account Preferences
                    </button>
                  </div>
                </form>
                {/* Card 2: Privacy & Telemetry Engine Controls */}
                <div className="bg-white/60 backdrop-blur-md p-5.5 rounded-3xl border border-white/70 shadow-xs space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold text-slate-900 block">Privacy & Telemetry Engine Controls</span>
                    <span className="text-[11px] text-slate-500">Configure background tracking engine & on-device classification</span>
                  </div>

                  <div className="space-y-3">
                    {/* Control 1: Live Engine */}
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                      <div>
                        <span className="text-xs font-medium text-slate-800 block">Live Activity Tracking Engine</span>
                        <span className="text-[10px] text-slate-500">Pause background telemetry engine at any time</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !trackingEngineActive;
                          setTrackingEngineActive(nextState);
                          setSettingsFeedbackMsg(nextState ? "Live telemetry tracking engine resumed." : "Live telemetry tracking engine paused.");
                          setTimeout(() => setSettingsFeedbackMsg(null), 3000);
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition cursor-pointer shrink-0 ${trackingEngineActive ? "bg-cyan-600" : "bg-slate-300"}`}
                        title="Toggle Live Background Telemetry Tracking"
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition transform ${trackingEngineActive ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Control 2: Automatic Window Tracking */}
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                      <div>
                        <span className="text-xs font-medium text-slate-800 block">Automatic Activity Logging</span>
                        <span className="text-[10px] text-slate-500">Record focused application windows locally</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={telemetryEnabled}
                        onChange={() => setTelemetryEnabled(!telemetryEnabled)}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </div>

                    {/* Control 3: AI Process Classifier */}
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                      <div>
                        <span className="text-xs font-medium text-slate-800 block">On-Device AI Classification</span>
                        <span className="text-[10px] text-slate-500">Categorize apps into 6 focus disciplines</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiClassificationEnabled}
                        onChange={() => setAiClassificationEnabled(!aiClassificationEnabled)}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </div>

                    {/* Control 4: Device Vault Encryption */}
                    <div className="flex items-center justify-between py-1.5">
                      <div>
                        <span className="text-xs font-medium text-slate-800 block">Device Local Vault Encryption</span>
                        <span className="text-[10px] text-slate-500">AES-256 local encrypted storage</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !localVaultEncryption;
                          setLocalVaultEncryption(nextState);
                          setSettingsFeedbackMsg(nextState ? "Device AES-256 local vault encryption enabled." : "Device local vault encryption disabled.");
                          setTimeout(() => setSettingsFeedbackMsg(null), 3000);
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition cursor-pointer shrink-0 ${localVaultEncryption ? "bg-cyan-600" : "bg-slate-300"}`}
                        title="Toggle On-Device AES-256 Vault Encryption"
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition transform ${localVaultEncryption ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 3: Excluded Private Applications */}
                <div className="bg-white/60 backdrop-blur-md p-5.5 rounded-3xl border border-white/70 shadow-xs space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold text-slate-900 block">Excluded Private Applications</span>
                    <span className="text-[11px] text-slate-500">Prevent sensitive desktop applications from being recorded in telemetry</span>
                  </div>

                  <form onSubmit={handleAddExcludedApp} className="flex space-x-2">
                    <input
                      type="text"
                      value={newExcludedAppInput}
                      onChange={(e) => setNewExcludedAppInput(e.target.value)}
                      placeholder="Add app to exclude (e.g. 1Password)..."
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900 shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
                    >
                      Exclude App
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {excludedApps.map((appName) => (
                      <span key={appName} className="px-3 py-1 bg-white/80 border border-slate-200 text-slate-700 text-xs rounded-full flex items-center space-x-1.5 shadow-2xs">
                        <EyeOff className="w-3 h-3 text-slate-500" />
                        <span>{appName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExcludedApp(appName)}
                          className="text-slate-400 hover:text-slate-700 text-xs ml-1 cursor-pointer font-bold"
                          title={`Remove ${appName} from excluded list`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card 4: Data Governance & Ownership */}
                <div className="bg-white/60 backdrop-blur-md p-5.5 rounded-3xl border border-white/70 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-semibold text-slate-900 block">Data Governance & Ownership</span>
                      <span className="text-[11px] text-slate-500">Export your local telemetry vault or purge all stored activity records</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Vita operates under a <strong>zero data vendor lock-in</strong> principle. You own 100% of your focus metrics and can download your raw activity logs anytime in standard JSON or CSV formats.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={handleExportJSON}
                        className="py-2.5 px-4 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                        title="Export All Personal Telemetry Logs as JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export JSON</span>
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="py-2.5 px-4 bg-slate-800 text-white text-xs font-medium rounded-xl hover:bg-slate-700 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                        title="Export Analytics Data as CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowPurgeModal(true)}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                      title="Permanently Purge & Delete Account Activity Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete Account & Data</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: Soft Cyan Glass Focus Intelligence Drawer (Home Only)     */}
        {/* ----------------------------------------------------------------------- */}
        {activeDockTab === "overview" && (
          showRightDrawer ? (
            <aside className="w-72 lg:w-80 bg-[#cde4eb]/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-xs flex flex-col justify-between shrink-0 relative overflow-y-auto">
              <div className="space-y-6">

                {/* Dynamic 3-Day Rolling Calculation & Curve Generation */}
                {(() => {
                  const getRolling3DayWindow = () => {
                    const days = [];
                    const now = new Date();
                    for (let i = 2; i >= 0; i--) {
                      const d = new Date(now);
                      d.setDate(d.getDate() - i);
                      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                      days.push({
                        dateObj: d,
                        name: dayName,
                        label: i === 0 ? "Today" : dayName,
                        isToday: i === 0
                      });
                    }
                    return days;
                  };

                  const rolling3Days = getRolling3DayWindow();

                  // Calculate REAL Focus Hours for [2 days ago, 1 day ago, today] from actual server sessions
                  const getRolling3DayHours = () => {
                    const now = new Date();
                    const hours = [0, 0, dailyFocusHours];

                    const day1Date = new Date(now);
                    day1Date.setDate(day1Date.getDate() - 1);
                    const day1DateStr = day1Date.toDateString();

                    const day0Date = new Date(now);
                    day0Date.setDate(day0Date.getDate() - 2);
                    const day0DateStr = day0Date.toDateString();

                    serverSessions.forEach(s => {
                      const sDateStr = new Date(s.created_at).toDateString();
                      if (sDateStr === day0DateStr) {
                        hours[0] += s.duration_minutes / 60;
                      } else if (sDateStr === day1DateStr) {
                        hours[1] += s.duration_minutes / 60;
                      }
                    });

                    return hours;
                  };

                  const [day0Hours, day1Hours, day2Hours] = getRolling3DayHours();
                  const maxVal = Math.max(4.0, day0Hours, day1Hours, day2Hours);

                  // Map focus hours to SVG Y coordinates (15 = max top, 40 = floor baseline)
                  const getY = (h: number) => {
                    const ratio = Math.min(1.0, Math.max(0.0, h / maxVal));
                    return (40 - ratio * 25).toFixed(1);
                  };

                  const y0 = getY(day0Hours);
                  const y1 = getY(day1Hours);
                  const y2 = getY(day2Hours);

                  const curvePath = `M 15 ${y0} C 40 ${y0}, 55 ${y1}, 85 ${y2}`;
                  const dynamicAreaPath = `M 15 ${y0} C 40 ${y0}, 55 ${y1}, 85 ${y2} L 85 45 L 15 45 Z`;

                  return (
                    <>
                      {/* Top Row: Focus Intelligence Label */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Focus Intelligence</span>
                      </div>

                      {/* Middle Stat Cards: Today's Focus & Remaining Target */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col space-y-0.5 bg-white/40 p-3 rounded-2xl border border-white/60">
                          <div className="text-3xl font-light text-slate-900 tracking-tight font-sans">
                            {dailyFocusHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">h</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Today's Focus</span>
                        </div>

                        <div className="flex flex-col space-y-0.5 bg-white/40 p-3 rounded-2xl border border-white/60">
                          <div className="text-3xl font-light text-slate-900 tracking-tight font-sans">
                            {Math.max(0, 7.0 - dailyFocusHours).toFixed(1)} <span className="text-xs font-normal text-slate-500">h</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Remaining Target</span>
                        </div>
                      </div>

                      {/* Unified Focus Performance & Intelligence Hero Card */}
                      <div className="bg-gradient-to-br from-white/80 via-white/60 to-[#b5dbe4]/40 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-xs space-y-4 relative overflow-hidden">

                        {/* Header Badge & Dynamic Rolling Window */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-cyan-900 bg-white/80 px-3 py-1 rounded-full border border-white/90 shadow-2xs">
                            ↑ {Math.min(100, Math.round((dailyFocusHours / 7.0) * 100))}% Flow Capacity
                          </span>
                          <span className="text-[10px] text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-white/60 shadow-2xs font-mono flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span>{rolling3Days[0].name} – {rolling3Days[2].label}</span>
                          </span>
                        </div>

                        {/* Main Readout: Focus Velocity & Pace Grid */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-light text-slate-900 font-sans tracking-tight">
                              {dailyFocusHours > 0 ? (dailyFocusHours / 2.0).toFixed(1) : "0.0"}x
                            </span>
                            <span className="text-xs text-slate-600 font-medium">Daily Focus Velocity</span>
                          </div>

                          {/* Mini Pace Breakdown Row */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-white/50 p-2 rounded-xl border border-white/60 flex flex-col">
                              <span className="text-[10px] text-slate-500 font-medium">Avg Velocity</span>
                              <span className="text-sm font-semibold text-slate-800 font-sans">
                                {dailyFocusHours > 0 ? (dailyFocusHours / 4.0).toFixed(1) : "0.0"} <span className="text-[10px] font-normal text-slate-500">h/s</span>
                              </span>
                            </div>
                            <div className="bg-white/50 p-2 rounded-xl border border-white/60 flex flex-col">
                              <span className="text-[10px] text-slate-500 font-medium">Peak Velocity</span>
                              <span className="text-sm font-semibold text-slate-800 font-sans">
                                {dailyFocusHours > 0 ? (dailyFocusHours / 2.5).toFixed(1) : "0.0"} <span className="text-[10px] font-normal text-slate-500">h/s</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Apple Health-Style 3-Day Vertical Bar Chart */}
                        <div className="pt-2">
                          <div className="flex items-end justify-between px-2 pt-1 border-t border-slate-200/50">
                            {[
                              { label: rolling3Days[0].name, hours: day0Hours, isToday: false },
                              { label: rolling3Days[1].name, hours: day1Hours, isToday: false },
                              { label: "Today", hours: day2Hours, isToday: true },
                            ].map((item, idx) => {
                              const heightPct = Math.min(100, Math.max(10, Math.round((item.hours / maxVal) * 100)));
                              return (
                                <div key={idx} className="flex flex-col items-center space-y-1.5 flex-1">
                                  {/* Duration tag floating above bar */}
                                  <span className={`text-[10px] font-mono font-medium ${item.isToday ? "text-cyan-900 font-bold" : "text-slate-500"}`}>
                                    {item.hours.toFixed(1)}h
                                  </span>

                                  {/* Vertical Bar Track & Fill */}
                                  <div className="w-10 h-20 bg-white/60 rounded-xl p-1 flex flex-col justify-end border border-white/80 shadow-2xs">
                                    <div
                                      className={`w-full rounded-lg transition-all duration-500 ${item.isToday
                                        ? "bg-gradient-to-t from-cyan-600 to-sky-400 shadow-xs"
                                        : item.hours > 0
                                          ? "bg-gradient-to-t from-slate-500 to-slate-300"
                                          : "bg-slate-200/70"
                                        }`}
                                      style={{ height: `${heightPct}%`, minHeight: "8px" }}
                                    />
                                  </div>

                                  {/* Day Label */}
                                  <span className={`text-[10px] ${item.isToday ? "text-cyan-900 font-bold" : "text-slate-500 font-medium"}`}>
                                    {item.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Action Bar: Export Focus Report */}
                <button
                  onClick={handleExportJSON}
                  className="w-full h-10 rounded-2xl bg-white/70 hover:bg-white text-slate-800 border border-white/90 text-xs font-medium flex items-center justify-between px-4 transition shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  title="Export Vita Focus Intelligence Report (JSON/CSV)"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Export Focus Report</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">JSON</span>
                </button>

                {/* Footer Module: Top Active Applications Mini-Leaderboard */}
                <div className="bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">Top Active Apps</span>
                    <span className="text-[10px] text-slate-600 bg-white/70 px-2.5 py-0.5 rounded-full border border-white/80 font-mono">
                      {Object.keys(appPctMap).length || 4} Tracked
                    </span>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    {(() => {
                      const sortedApps = Object.entries(appPctMap)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4);

                      // Fallback list if appPctMap is empty
                      const displayApps: [string, number][] = sortedApps.length > 0 ? sortedApps : [
                        ["Antigravity", 71],
                        ["Firefox", 7],
                        ["Safari", 6],
                        ["Notes", 6],
                      ];

                      return displayApps.map(([appName, pct]) => {
                        const seconds = appSecondsMap[appName] || Math.round((pct / 100) * (dailyFocusHours || 0.3) * 3600);
                        const hours = (seconds / 3600).toFixed(1);

                        return (
                          <div
                            key={appName}
                            onClick={() => setSelectedApp(appName)}
                            className="p-2.5 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 transition cursor-pointer space-y-1.5 shadow-2xs"
                            title={`Inspect telemetry breakdown for ${appName}`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-800 truncate">{appName}</span>
                              <div className="flex items-center space-x-1.5 font-mono text-[10px] shrink-0">
                                <span className="font-semibold text-slate-900">{pct}%</span>
                                <span className="text-slate-400">({hours}h)</span>
                              </div>
                            </div>

                            {/* Minimal Neutral Progress Bar */}
                            <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-800 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(6, pct))}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
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
          )
        )}

      </div>

      {/* FLOATING BOTTOM DOCK: Screen-centered across all views */}
      <DockNav activeTab="overview" />

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

      {/* ACTIVITY DETAILS MODAL */}
      {selectedSessionDetail && (() => {
        const s = selectedSessionDetail;
        const sDate = s.created_at ? new Date(s.created_at) : new Date();
        const startTime = sDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const endDate = new Date(sDate.getTime() + (s.duration_minutes || 25) * 60000);
        const endTime = endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const durHours = Math.floor(s.duration_minutes / 60);
        const durMins = s.duration_minutes % 60;
        const durFormatted = durHours > 0 ? `${durHours}h ${durMins > 0 ? `${durMins}m` : ""}` : `${durMins}m`;

        const isPersonal = s.category?.toLowerCase().includes("health") || s.category?.toLowerCase().includes("gym") || s.category?.toLowerCase().includes("personal");
        const isAdmin = s.category?.toLowerCase().includes("admin") || s.category?.toLowerCase().includes("routine") || s.category?.toLowerCase().includes("mail");
        const matchedCat = categories.find(c => c.name === s.category || (s.category?.toLowerCase().includes("engineer") && c.name.toLowerCase().includes("coding")));

        const badgeStyle = isPersonal
          ? "bg-rose-100 text-rose-950 border-rose-200"
          : isAdmin
            ? "bg-teal-100 text-teal-950 border-teal-200"
            : (matchedCat?.badgeColor || "bg-cyan-100 text-cyan-950 border-cyan-200");

        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedSessionDetail(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in cursor-pointer"
          >
            <div className="bg-[#eef5f8]/95 backdrop-blur-xl border border-white/90 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 animate-scale-up cursor-default">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-base font-semibold text-slate-900 truncate" title={s.app_name}>
                    {s.app_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSessionDetail(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details List */}
              <div className="bg-white/80 rounded-2xl border border-slate-200/60 p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-medium border text-[11px] ${badgeStyle}`}>
                    {s.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Time Window</span>
                  <span className="font-mono font-medium text-slate-900">{startTime} – {endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Duration</span>
                  <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                    {s.duration_minutes}m ({durFormatted})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Flow Score</span>
                  <span className="font-mono font-semibold text-cyan-700">
                    {Math.round(s.efficiency_score)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteSession(s.id);
                    setSelectedSessionDetail(null);
                  }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Remove Activity
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSessionDetail(null)}
                  className="px-5 py-2 bg-[#181a1b] hover:bg-slate-900 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
