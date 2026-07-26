"use client";

import React, { useState, useEffect } from "react";
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
  CheckSquare
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Navigation & View States
  const [activeDockTab, setActiveDockTab] = useState<DockTab>("overview");
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(true);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<string | null>("VS Code");
  
  // Interactive Focus Dial Timer States
  const [activeSessionRunning, setActiveSessionRunning] = useState<boolean>(true);
  const [sprintDuration, setSprintDuration] = useState<number>(25); // 15, 25, 45, 60 mins
  const [timerSeconds, setTimerSeconds] = useState<number>(21 * 60 + 40); // 21m 40s
  const [activeAppFilter, setActiveAppFilter] = useState<"all" | "dev" | "design">("all");
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [focusAudioMode, setFocusAudioMode] = useState<boolean>(false);

  // Privacy & Governance States
  const [trackingEngineActive, setTrackingEngineActive] = useState<boolean>(true);
  const [localVaultEncryption, setLocalVaultEncryption] = useState<boolean>(true);
  const [excludedApps, setExcludedApps] = useState<string[]>(["SOGO Mail", "1Password", "Banking App"]);

  // Focus Tasks State
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [taskList, setTaskList] = useState<TaskItem[]>([
    { id: "1", title: "Complete API Auth Microservice", category: "Engineering", spentHours: 2.5, targetHours: 3.5, completed: false },
    { id: "2", title: "Design Glassmorphic UI Tokens", category: "Design", spentHours: 1.8, targetHours: 2.0, completed: false },
    { id: "3", title: "Refactor Database Query Performance", category: "Engineering", spentHours: 1.2, targetHours: 1.5, completed: true },
    { id: "4", title: "Review Product Architecture Specs", category: "Research", spentHours: 0.8, targetHours: 1.0, completed: true }
  ]);

  // Live Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSessionRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setActiveSessionRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSessionRunning, timerSeconds]);

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cycle Pomodoro sprint length
  const cycleSprintDuration = () => {
    const options = [15, 25, 45, 60];
    const nextDuration = options[(options.indexOf(sprintDuration) + 1) % options.length];
    setSprintDuration(nextDuration);
    setTimerSeconds(nextDuration * 60);
    setActiveSessionRunning(true);
  };

  // Progress Calculations for Live Central Dial & Indicator Rotation
  const totalSprintSeconds = sprintDuration * 60;
  const elapsedSeconds = Math.max(0, totalSprintSeconds - timerSeconds);
  const progressFraction = Math.max(0, Math.min(1, elapsedSeconds / totalSprintSeconds));

  // Add new task
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newGoalTitle,
      category: "Engineering",
      spentHours: 0,
      targetHours: 2.0,
      completed: false
    };
    setTaskList([newTask, ...taskList]);
    setNewGoalTitle("");
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTaskList(taskList.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#e4e7e4] text-slate-800 flex flex-col p-4 sm:p-6 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Logo | Vita Focus Metrics | Control Buttons & User Profile */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between px-2 pb-4 shrink-0">
        
        {/* Left: Brand Logo matching App Concept */}
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <h1 className="font-[family-name:var(--font-hubballi)] text-3xl font-normal leading-none tracking-normal text-slate-900 flex items-center">
            vita<span className="text-[10px] font-sans font-light tracking-wider relative top-[-10px] ml-0.5 opacity-60 text-slate-500">TM</span>
          </h1>
        </div>

        {/* Center-Right: 4 Vita Focus Metrics Bar */}
        <div className="hidden md:flex items-center space-x-12 lg:space-x-16">
          
          {/* Metric 1: Daily Focus */}
          <div className="flex flex-col">
            <span className="text-[12px] font-normal text-slate-400 tracking-wide">Daily Focus</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-light tracking-tight text-slate-900 font-sans">4,55</span>
              <span className="text-xs text-slate-400 font-normal">hrs</span>
            </div>
          </div>

          {/* Metric 2: Weekly Focus */}
          <div className="flex flex-col">
            <span className="text-[12px] font-normal text-slate-400 tracking-wide">Weekly Focus</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-light tracking-tight text-slate-900 font-sans">28,4</span>
              <span className="text-xs text-slate-400 font-normal">hrs</span>
            </div>
          </div>

          {/* Metric 3: Focus Score */}
          <div className="flex flex-col">
            <span className="text-[12px] font-normal text-slate-400 tracking-wide">Focus Score</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-light tracking-tight text-slate-900 font-sans">85</span>
              <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
          </div>

          {/* Metric 4: Tasks Done */}
          <div className="flex flex-col">
            <span className="text-[12px] font-normal text-slate-400 tracking-wide">Tasks Done</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-light tracking-tight text-slate-900 font-sans">
                {taskList.filter(t => t.completed).length}
              </span>
              <span className="text-xs text-slate-400 font-normal">/{taskList.length}</span>
            </div>
          </div>

        </div>

        {/* Right Action Icons & Avatar */}
        <div className="flex items-center space-x-2">
          
          {/* Action Button 1: Re-sync Activity Engine */}
          <button 
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300/70 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Re-sync Activity Engine (Reload)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 2: Focus Alerts & Notifications */}
          <button 
            onClick={() => setNotificationActive(!notificationActive)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${notificationActive ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"}`}
            title="Toggle Focus Alerts & Break Reminders"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 3: Privacy & Engine Preferences */}
          <button 
            onClick={() => setActiveDockTab("settings")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "settings" ? "bg-slate-900 text-white" : "bg-slate-200/70 hover:bg-slate-300/70 text-slate-700"}`}
            title="Privacy & Engine Preferences"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>

          {/* Action Button 4: User Profile & Account Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-medium flex items-center justify-center shadow-xs hover:ring-2 hover:ring-slate-400 transition cursor-pointer"
              title="User Account Menu"
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
                  onClick={() => { logout(); router.push("/login"); }}
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
                282 <span className="text-sm font-normal text-slate-400">hrs</span>
              </div>
            </div>

            {/* Mathematically Exact Semi-Circle Arc Gauge (Radius = 38) */}
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
                  d="M 12 50 A 38 38 0 0 1 83.86 32.75"
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
                <line x1="50" y1="50" x2="83.86" y2="32.75" stroke="#181a1b" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="3.5" fill="#181a1b" />
              </svg>
            </div>
            
            <span className="text-[10px] text-slate-500 font-mono">85% of Weekly Focus Target</span>
          </div>

          {/* Session Item 1: Coding & Engineering */}
          <div className="bg-[#dcdfdc]/60 rounded-2xl p-3.5 border border-white/30 flex items-center justify-between text-xs transition-all hover:bg-[#dcdfdc]/80">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Coding & Dev</span>
              <div className="w-12 h-1 bg-slate-300 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-600" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">65 %</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-100/90 text-cyan-900 border border-cyan-300/50 text-[10px] font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse-subtle" />
                <span>Active</span>
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
            </div>
          </div>

          {/* Session Item 2: Expanded Deep Work Focus Block */}
          <div className="bg-[#dcdfdc]/80 rounded-2xl p-4 border border-white/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-900 font-medium">Deep Work Session</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-white/80 text-[10px] text-slate-800 font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse-subtle" />
                  <span>Recording</span>
                </span>
                <Settings className="w-3.5 h-3.5 text-slate-600 cursor-pointer" />
                <ChevronUp className="w-3.5 h-3.5 text-slate-600 cursor-pointer" />
              </div>
            </div>

            <div className="text-center py-2">
              <span className="text-[11px] text-slate-400">Focus Efficiency</span>
              <div className="text-3xl font-light text-slate-900 tracking-tight mt-0.5">
                85 <span className="text-sm font-normal text-slate-400">%</span>
              </div>
            </div>

            {/* Micro Sparkline Indicator Bar */}
            <div className="h-4 flex items-end space-x-0.5 px-2">
              {[30, 45, 60, 40, 75, 90, 85, 70, 95, 80, 65, 85, 90, 100, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-600/70 rounded-xs" style={{ height: `${h}%` }} />
              ))}
            </div>

            {/* Action Button: Pause / Resume Session */}
            <button
              onClick={() => setActiveSessionRunning(!activeSessionRunning)}
              className="w-full h-11 rounded-full bg-[#181a1b] text-white text-xs font-medium flex items-center justify-between px-5 hover:bg-slate-900 transition shadow-sm cursor-pointer"
              title="Toggle Live Session Recording"
            >
              <span>{activeSessionRunning ? "Pause Focus Session" : "Resume Focus Session"}</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                {activeSessionRunning ? (
                  <Square className="w-2.5 h-2.5 fill-white text-white" />
                ) : (
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                )}
              </div>
            </button>
          </div>

          {/* Session Item 3: Design & UI */}
          <div className="bg-[#dcdfdc]/60 rounded-2xl p-3.5 border border-white/30 flex items-center justify-between text-xs transition-all hover:bg-[#dcdfdc]/80">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Design & UI</span>
              <div className="w-12 h-1 bg-slate-300 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-indigo-500" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">49 %</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[10px] text-slate-600">Tracked</span>
              <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
            </div>
          </div>

          {/* Session Item 4: Research & Docs */}
          <div className="bg-[#dcdfdc]/60 rounded-2xl p-3.5 border border-white/30 flex items-center justify-between text-xs transition-all hover:bg-[#dcdfdc]/80">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Research & Docs</span>
              <div className="w-12 h-1 bg-slate-300 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-slate-500" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">35 %</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[10px] text-slate-600">Tracked</span>
              <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
            </div>
          </div>

        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER AREA: Swappable Views with Silky Page Entrance Transitions */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col items-center justify-between relative min-h-0">
          
          {/* VIEW 1: OVERVIEW CANVAS (Main Focus Command Center Dial & App Orbit) */}
          {activeDockTab === "overview" && (
            <div className="w-full flex-1 flex flex-col items-center justify-between min-h-0 relative animate-page-entrance">
              
              {/* Action Button: Start Focus Sprint */}
              <button 
                onClick={() => {
                  setTimerSeconds(sprintDuration * 60);
                  setActiveSessionRunning(true);
                }}
                className="h-10 px-5 rounded-full bg-[#181a1b] text-white text-xs font-medium flex items-center space-x-2 shadow-md hover:bg-slate-900 transition cursor-pointer z-10"
                title="Start New Focus Sprint Block"
              >
                <Plus className="w-4 h-4" />
                <span>Start Focus Sprint ({sprintDuration}m)</span>
              </button>

              {/* Central Canvas with Safe Orbital Perimeter Positions for App Nodes */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-visible">
                
                {/* ORBITAL APPLICATION BUBBLE NODES (STAGGERED SHAPE-AWARE ENTRANCE POP) */}
                {(activeAppFilter === "all" || activeAppFilter === "dev") && (
                  <div 
                    onClick={() => setSelectedApp("VS Code")}
                    style={{ animationDelay: "60ms" }}
                    className={`absolute top-2 left-4 sm:left-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "VS Code" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/90 border-white/80 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[11px] text-slate-400 font-light font-mono">69 %</span>
                    <span className="text-xs font-medium text-slate-800 mt-0.5">VS Code</span>
                  </div>
                )}

                {(activeAppFilter === "all" || activeAppFilter === "design") && (
                  <div 
                    onClick={() => setSelectedApp("Figma")}
                    style={{ animationDelay: "110ms" }}
                    className={`absolute top-28 left-1 sm:left-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "Figma" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/85 border-white/70 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono">49 %</span>
                    <span className="text-[11px] font-medium text-slate-800">Figma</span>
                  </div>
                )}

                {activeAppFilter === "all" && (
                  <div 
                    onClick={() => setSelectedApp("Chrome")}
                    style={{ animationDelay: "160ms" }}
                    className={`absolute bottom-20 left-2 sm:left-8 w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "Chrome" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/80 border-white/70 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[9px] text-slate-400 font-mono">44 %</span>
                    <span className="text-[10px] font-medium text-slate-800">Chrome</span>
                  </div>
                )}

                {(activeAppFilter === "all" || activeAppFilter === "dev") && (
                  <div 
                    onClick={() => setSelectedApp("iTerm")}
                    style={{ animationDelay: "210ms" }}
                    className={`absolute bottom-2 left-10 sm:left-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "iTerm" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/75 border-white/60 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[9px] text-slate-500 font-mono">58 %</span>
                    <span className="text-[9px] font-medium text-slate-700">iTerm</span>
                  </div>
                )}

                {activeAppFilter === "all" && (
                  <div 
                    onClick={() => setSelectedApp("Slack")}
                    style={{ animationDelay: "260ms" }}
                    className={`absolute bottom-1 left-[32%] w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "Slack" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/80 border-white/70 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono">72 %</span>
                    <span className="text-[9px] font-medium text-slate-800">Slack</span>
                  </div>
                )}

                {activeAppFilter === "all" && (
                  <div 
                    onClick={() => setSelectedApp("Notion")}
                    style={{ animationDelay: "310ms" }}
                    className={`absolute bottom-1 right-[32%] w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "Notion" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/80 border-white/70 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono">57 %</span>
                    <span className="text-[9px] font-medium text-slate-800">Notion</span>
                  </div>
                )}

                {(activeAppFilter === "all" || activeAppFilter === "dev") && (
                  <div 
                    onClick={() => setSelectedApp("Docker")}
                    style={{ animationDelay: "360ms" }}
                    className={`absolute bottom-4 right-4 sm:right-12 w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer animate-node-pop hover:scale-105 ${selectedApp === "Docker" ? "bg-white border-slate-700 ring-2 ring-slate-400 shadow-md" : "bg-[#dceef3]/80 border-white/70 shadow-2xs hover:bg-white"}`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono">64 %</span>
                    <span className="text-[9px] font-medium text-slate-800">Docker</span>
                  </div>
                )}

                {/* MAIN CENTRAL FOCUS DIAL WIDGET WITH SHAPE-AWARE DIAL EXPANSION */}
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
                        Focus Sprint • {sprintDuration}m Block
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
                          {activeSessionRunning ? "Deep Work Active" : "Session Paused"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ARC MENU ON THE RIGHT EDGE OF MAIN DIAL */}
                  <div className="absolute -right-14 flex flex-col space-y-2 bg-[#b9d5de]/90 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-md z-20">
                    <button 
                      onClick={cycleSprintDuration}
                      title={`Change Sprint Length (Current: ${sprintDuration}m)`}
                      className="w-10 h-10 rounded-xl bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center transition cursor-pointer"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const filters: Array<"all" | "dev" | "design"> = ["all", "dev", "design"];
                        const next = filters[(filters.indexOf(activeAppFilter) + 1) % filters.length];
                        setActiveAppFilter(next);
                      }}
                      title={`Filter App Nodes (Current: ${activeAppFilter.toUpperCase()})`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${activeAppFilter !== "all" ? "bg-slate-900 text-white" : "bg-white/70 hover:bg-white text-slate-700"}`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setFocusAudioMode(!focusAudioMode)}
                      title={`Focus Audio Preset (${focusAudioMode ? "Deep Focus Ambient ON" : "Muted"})`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${focusAudioMode ? "bg-slate-900 text-white" : "bg-white/70 hover:bg-white text-slate-700"}`}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
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
                  Peak Window: 10:00 - 12:30
                </span>
              </div>

              {/* Timeline Items */}
              <div className="space-y-3 pt-2">
                {[
                  { time: "09:00 - 11:30", title: "Deep Work Code Sprint", app: "VS Code", duration: "2h 30m", efficiency: "92%", status: "Peak Flow State", color: "border-l-cyan-600" },
                  { time: "11:30 - 12:15", title: "UI Tokens & Wireframes", app: "Figma", duration: "45m", efficiency: "85%", status: "High Velocity", color: "border-l-indigo-500" },
                  { time: "13:30 - 15:00", title: "Architecture & Tech Specs", app: "Notion", duration: "1h 30m", efficiency: "78%", status: "Focused", color: "border-l-slate-600" },
                  { time: "15:15 - 17:00", title: "API Authentication Microservice", app: "VS Code", duration: "1h 45m", efficiency: "88%", status: "Active Sprint", color: "border-l-cyan-500" }
                ].map((item, idx) => (
                  <div key={idx} className={`bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-xs border-l-4 ${item.color} flex items-center justify-between transition-all hover:bg-white/80`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-500">{item.time}</span>
                        <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">Tracked in <strong className="text-slate-700">{item.app}</strong> ({item.duration})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-light text-slate-900 block">{item.efficiency}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{item.status}</span>
                    </div>
                  </div>
                ))}
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
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2.5 pt-2">
                {taskList.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-xs flex items-center justify-between transition-all hover:bg-white/80 ${task.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer ${task.completed ? "bg-slate-900 border-slate-900 text-white" : "border-slate-400 bg-white text-transparent"}`}
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
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: ANALYTICS (Time Allocation & Trends) */}
          {activeDockTab === "analytics" && (
            <div className="w-full flex-1 flex flex-col space-y-5 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div>
                <h2 className="text-xl font-light text-slate-900">Productivity & Time Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive breakdown of time allocation across software & categories</p>
              </div>

              {/* Category Breakdown Progress */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <span className="text-xs font-medium text-slate-900">Digital Activity Category Distribution</span>
                
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-cyan-600" style={{ width: "45%" }} title="Engineering (45%)" />
                  <div className="h-full bg-indigo-500" style={{ width: "25%" }} title="Design (25%)" />
                  <div className="h-full bg-amber-500" style={{ width: "18%" }} title="Communication (18%)" />
                  <div className="h-full bg-slate-500" style={{ width: "12%" }} title="Research (12%)" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                    <div>
                      <span className="text-slate-800 font-medium block">Engineering</span>
                      <span className="text-[10px] text-slate-500">12.5 hrs (45%)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <div>
                      <span className="text-slate-800 font-medium block">Design & UI</span>
                      <span className="text-[10px] text-slate-500">7.1 hrs (25%)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div>
                      <span className="text-slate-800 font-medium block">Communication</span>
                      <span className="text-[10px] text-slate-500">5.1 hrs (18%)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <div>
                      <span className="text-slate-800 font-medium block">Research</span>
                      <span className="text-[10px] text-slate-500">3.4 hrs (12%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Deep Work vs Interruption Bar Chart */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900">Weekly Deep Focus vs Distractions</span>
                  <span className="text-[10px] text-slate-500 font-mono">Avg 5.6h / day</span>
                </div>

                <div className="h-32 flex items-end justify-between px-4 pt-4 pb-2 border-b border-slate-200">
                  {[
                    { day: "Mon", focus: 80, dist: 20 },
                    { day: "Tue", focus: 95, dist: 15 },
                    { day: "Wed", focus: 70, dist: 30 },
                    { day: "Thu", focus: 85, dist: 10 },
                    { day: "Fri", focus: 60, dist: 40 },
                    { day: "Sat", focus: 40, dist: 10 },
                    { day: "Sun", focus: 30, dist: 5 }
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

              {/* Recommendation Card 1 */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-400/30 p-4.5 rounded-2xl shadow-xs space-y-2 transition-all hover:shadow-md">
                <div className="flex items-center space-x-2 text-cyan-900">
                  <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse-subtle" />
                  <span className="text-xs font-semibold">Optimal Peak Focus Window Identified</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your flow state efficiency reaches <strong>92%</strong> when starting deep work sprints between <strong>10:00 AM and 12:30 PM</strong>. We recommend scheduling high-complexity engineering tasks during this window.
                </p>
              </div>

              {/* Recommendation Card 2 */}
              <div className="bg-white/60 backdrop-blur-md p-4.5 rounded-2xl border border-white/70 shadow-xs space-y-2 transition-all hover:shadow-md">
                <div className="flex items-center space-x-2 text-amber-900">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold">Context Switch Reduction Tip</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Slack notifications caused 14 context switches yesterday around 2:30 PM. Enabling <strong>Focus Audio Shield</strong> during afternoon blocks increases task completion velocity by 34%.
                </p>
              </div>

              {/* Recommendation Card 3 */}
              <div className="bg-white/60 backdrop-blur-md p-4.5 rounded-2xl border border-white/70 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-900">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold">5-Day Target Streak</span>
                  </div>
                  <p className="text-xs text-slate-500">You've hit your 4.5h daily focus goal 5 days in a row!</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
                  Active Streak
                </span>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS (Privacy Controls & Data Governance) */}
          {activeDockTab === "settings" && (
            <div className="w-full flex-1 flex flex-col space-y-5 p-4 overflow-y-auto max-w-2xl mx-auto animate-page-entrance">
              <div>
                <h2 className="text-xl font-light text-slate-900">Privacy & Data Governance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Vita is privacy-first. You have 100% control over telemetry, encryption, and data retention.</p>
              </div>

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
                    onClick={() => setTrackingEngineActive(!trackingEngineActive)}
                    className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${trackingEngineActive ? "bg-cyan-600" : "bg-slate-300"}`}
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
                    onClick={() => setLocalVaultEncryption(!localVaultEncryption)}
                    className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${localVaultEncryption ? "bg-cyan-600" : "bg-slate-300"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition transform ${localVaultEncryption ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Control 3: Excluded Apps List */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-medium text-slate-800 block">Excluded Private Applications</span>
                  <div className="flex flex-wrap gap-2">
                    {excludedApps.map((app, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-200/80 text-slate-700 text-xs rounded-full flex items-center space-x-1">
                        <EyeOff className="w-3 h-3" />
                        <span>{app}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Governance & Export/Delete Actions */}
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-xs space-y-4">
                <span className="text-xs font-semibold text-slate-900 block">Data Governance & Ownership</span>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Export Button */}
                  <button
                    onClick={() => alert("Exporting all Vita activity telemetry as encrypted JSON file...")}
                    className="w-full sm:w-auto h-10 px-5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Telemetry Data (JSON/CSV)</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to permanently delete all tracked activity logs? This action cannot be undone.")) {
                        alert("All tracked activity logs have been permanently purged from your account.");
                      }
                    }}
                    className="w-full sm:w-auto h-10 px-5 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
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
                title="Dashboard Overview Canvas"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "overview" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Dock Button 2: Activity Timeline */}
              <button
                onClick={() => setActiveDockTab("calendar")}
                title="Activity & Focus Timeline"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "calendar" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Dock Button 3: Focus Tasks */}
              <button
                onClick={() => setActiveDockTab("tasks")}
                title="Task Management Queue"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "tasks" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Dock Button 4: Analytics */}
              <button
                onClick={() => setActiveDockTab("analytics")}
                title="App Time Allocation & Analytics"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "analytics" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <PieChart className="w-4 h-4" />
              </button>

              {/* Dock Button 5: AI Insights */}
              <button
                onClick={() => setActiveDockTab("insights")}
                title="AI Productivity Coach & Tips"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "insights" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Dock Button 6: Privacy Settings */}
              <button
                onClick={() => setActiveDockTab("settings")}
                title="Privacy Settings & Data Governance"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${activeDockTab === "settings" ? "bg-[#181a1b] text-white shadow-md" : "text-slate-700 hover:bg-white/60"}`}
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
                    <span className="text-3xl font-light text-slate-900">4,5</span>
                    <span className="text-xs text-slate-500 font-normal">h</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Today's Focus</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-light text-slate-900">2,5</span>
                    <span className="text-xs text-slate-500 font-normal">h</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Remaining Target</span>
                </div>
              </div>

              {/* Ascending Focus Curve Line Graph (Cyan Auth Tone) */}
              <div className="relative h-44 w-full pt-4">
                
                {/* Floating Callout Tag 1: Soft Cyan Glass Badge */}
                <div className="absolute top-2 right-4 bg-cyan-100/90 text-cyan-950 text-[10px] px-2.5 py-1 rounded-full border border-cyan-300/80 shadow-xs font-medium flex items-center space-x-1">
                  <span>↑ 85% - Peak Flow State</span>
                </div>

                {/* Floating Callout Tag 2: Soft Indigo Glass Badge */}
                <div className="absolute top-16 left-12 bg-indigo-100/90 text-indigo-950 text-[10px] px-2 py-0.5 rounded-full border border-indigo-300/80 shadow-xs">
                  <span>2.8 x - High Velocity</span>
                </div>

                {/* Curve Line SVG */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path
                    d="M 0 45 Q 25 43, 50 38 T 100 5"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0 45 Q 25 43, 50 38 T 100 5 L 100 50 L 0 50 Z"
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
                className="w-full h-11 rounded-full bg-[#181a1b] text-white text-xs font-medium flex items-center justify-between px-5 hover:bg-slate-900 transition shadow-md cursor-pointer"
                title="Download Today's Focus Metrics Report"
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
                  <div className="flex flex-col space-y-1 bg-white/20 p-2 rounded-xl border border-white/30">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-light text-slate-900">1,2</span>
                      <span className="text-[11px] text-slate-500">h/s</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Average Velocity</span>
                    
                    {/* Smooth Continuous Wave SVG with Safe Top & Bottom Margins */}
                    <div className="h-8 w-full pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35">
                        <path
                          d="M 5 22 Q 25 10, 50 20 T 95 14"
                          fill="none"
                          stroke="#0891b2"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Column 2: Peak Velocity */}
                  <div className="flex flex-col space-y-1 bg-white/20 p-2 rounded-xl border border-white/30">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-light text-slate-900">1,8</span>
                      <span className="text-[11px] text-slate-500">h/s</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Peak Velocity</span>

                    {/* Clean Rising Velocity Curve SVG with Peak Indicator Dot */}
                    <div className="h-8 w-full pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35">
                        <path
                          d="M 5 26 Q 40 22, 70 14 T 92 8"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="92" cy="8" r="3" fill="#0284c7" />
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
              className="w-10 h-36 bg-[#cde4eb]/90 hover:bg-[#cde4eb] backdrop-blur-md rounded-l-2xl border-l border-y border-white/60 shadow-md flex flex-col items-center justify-center space-y-2 text-slate-700 cursor-pointer transition"
              title="Open Focus Intelligence Drawer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                Focus Intelligence
              </span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
