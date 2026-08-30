"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Bell,
  User,
  LogOut,
  EyeOff,
  Download,
  Trash2,
  Grid,
  Calendar,
  FileText,
  PieChart,
  Bookmark,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DockNav } from "@/components/navigation/DockNav";
import { TypewriterSessionLoader } from "@/components/loader/TypewriterSessionLoader";

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profileNameInput, setProfileNameInput] = useState<string>(user?.name || "Issam");
  const [profileEmailInput, setProfileEmailInput] = useState<string>(user?.email || "issam@example.com");
  const [settingsFeedbackMsg, setSettingsFeedbackMsg] = useState<string | null>(null);

  const [trackingEngineActive, setTrackingEngineActive] = useState<boolean>(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState<boolean>(true);
  const [aiClassificationEnabled, setAiClassificationEnabled] = useState<boolean>(true);
  const [localVaultEncryption, setLocalVaultEncryption] = useState<boolean>(true);

  const [excludedApps, setExcludedApps] = useState<string[]>(["1Password", "Bitwarden", "Messages"]);
  const [newExcludedAppInput, setNewExcludedAppInput] = useState<string>("");
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState<boolean>(true);

  // Header State
  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user || token) {
      if (user?.name) setProfileNameInput(user.name);
      if (user?.email) setProfileEmailInput(user.email);
    }
    const timer = setTimeout(() => setIsInitialDataLoading(false), 50);
    return () => clearTimeout(timer);
  }, [user, token]);

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

  const handleAddExcludedApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcludedAppInput.trim()) return;
    const app = newExcludedAppInput.trim();
    if (!excludedApps.includes(app)) {
      setExcludedApps((prev) => [...prev, app]);
    }
    setNewExcludedAppInput("");
  };

  const handleRemoveExcludedApp = (app: string) => {
    setExcludedApps((prev) => prev.filter((a) => a !== app));
  };

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedbackMsg("Account preferences updated successfully.");
    setTimeout(() => setSettingsFeedbackMsg(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, exported_at: new Date().toISOString() }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vita_vault_export_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["Setting", "Value"];
    const rows = [
      ["Display Name", `"${profileNameInput}"`],
      ["Email Address", `"${profileEmailInput}"`],
      ["Tracking Engine Active", trackingEngineActive ? "true" : "false"],
      ["Telemetry Enabled", telemetryEnabled ? "true" : "false"],
      ["AI Classification", aiClassificationEnabled ? "true" : "false"],
      ["Local Encryption", localVaultEncryption ? "true" : "false"],
      ["Excluded Apps", `"${excludedApps.join(", ")}"`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `vita_settings_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const executePurge = () => {
    setShowPurgeModal(false);
    logout();
    router.push("/login");
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

        {/* Center Header Column */}
        <div className="flex-1 hidden md:flex items-center justify-center space-x-8 lg:space-x-12 px-4">
          <span className="text-xs font-mono text-slate-700 bg-white/80 px-4 py-1.5 rounded-full border border-white/90 shadow-2xs font-medium">
            On-Device Vault Governance
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

      {/* 2. MAIN VIEWPORT: Exact Original Settings View */}
      <div className="max-w-6xl w-full mx-auto flex-1 min-h-0 space-y-6 p-4 overflow-y-auto pb-24 animate-page-entrance">
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

      {/* 3. FLOATING BOTTOM DOCK: Always visible pinned navigation */}
      <DockNav activeTab="settings" />

      {/* Delete Account Modal */}
      {showPurgeModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowPurgeModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div className="bg-[#e2eef2]/95 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-3 animate-scale-up cursor-default">
            <h3 className="text-base font-medium text-slate-900">Delete Account & Purge Data?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              This action will permanently delete your account profile, all tracked focus sessions, tasks, and telemetry logs.
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
                onClick={executePurge}
                className="px-4 py-2 bg-[#181a1b] hover:bg-slate-900 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
