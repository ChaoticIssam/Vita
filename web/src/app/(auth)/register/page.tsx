"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Camera, 
  Sparkles, 
  User as UserIcon, 
  ArrowRight, 
  ArrowLeft,
  Code2,
  Palette,
  BookOpen,
  FileText,
  BarChart3,
  Briefcase
} from "lucide-react";

const PRESET_AVATARS = [
  { id: "cyan", name: "Cyberpunk Cyan", bg: "bg-gradient-to-tr from-cyan-500 to-indigo-600", text: "text-white" },
  { id: "emerald", name: "Focus Emerald", bg: "bg-gradient-to-tr from-emerald-500 to-teal-700", text: "text-white" },
  { id: "indigo", name: "Deep Indigo", bg: "bg-gradient-to-tr from-indigo-600 to-purple-800", text: "text-white" },
  { id: "amber", name: "Amber Horizon", bg: "bg-gradient-to-tr from-amber-500 to-rose-600", text: "text-white" },
  { id: "obsidian", name: "Minimal Obsidian", bg: "bg-gradient-to-tr from-slate-700 to-slate-900", text: "text-white" },
];

const FOCUS_DISCIPLINES = [
  {
    id: "Coding & Dev",
    title: "Coding & Dev",
    desc: "Track IDEs, terminals, Git & dev servers",
    Icon: Code2,
  },
  {
    id: "Design & UI",
    title: "Design & UI",
    desc: "Track Figma, Adobe & design tools",
    Icon: Palette,
  },
  {
    id: "Reading & Research",
    title: "Reading & Research",
    desc: "Track browsers, PDF readers & academic docs",
    Icon: BookOpen,
  },
  {
    id: "Writing & Docs",
    title: "Writing & Docs",
    desc: "Track Notion, Obsidian, Word & Markdown",
    Icon: FileText,
  },
  {
    id: "Data & Analytics",
    title: "Data & Analytics",
    desc: "Track Jupyter, SQL tools & spreadsheets",
    Icon: BarChart3,
  },
  {
    id: "Product & Strategy",
    title: "Product & Strategy",
    desc: "Track Slack, Linear, Jira & management",
    Icon: Briefcase,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, token, isLoading, register, updateProfile } = useAuth();

  // 3-Level Onboarding Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account Signup Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 & 3: Avatar & Focus Calibration
  const [avatarUrl, setAvatarUrl] = useState<string>("preset:cyan");
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([
    "Coding & Dev",
    "Design & UI",
    "Reading & Research"
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: User Registration
  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Register account immediately in database
      await register(name, email, password);
      setIsSubmitting(false);
      // Advance to Avatar Customization (Step 2)
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  // Canvas Image Resizer: Resizes uploaded photo to compact 128x128 thumbnail
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 128, 128);
          const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCustomImagePreview(resizedDataUrl);
          setAvatarUrl(resizedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleDiscipline = (id: string) => {
    if (selectedDisciplines.includes(id)) {
      if (selectedDisciplines.length === 1) return;
      setSelectedDisciplines(selectedDisciplines.filter((d) => d !== id));
    } else {
      setSelectedDisciplines([...selectedDisciplines, id]);
    }
  };

  // Step 3: Complete Setup & Save Profile
  const handleFinalSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Update registered user profile with Avatar and Focus Disciplines
      await updateProfile({
        avatar_url: avatarUrl,
        focus_fields: selectedDisciplines
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update studio profile. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP 1: ORIGINAL SIGNUP PAGE (Account Credentials - Dark Auth Card)
  // =========================================================================
  if (step === 1) {
    return (
      <div className="flex w-full flex-col items-center justify-center font-sans select-none" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Top Header: Dark Auth Logo */}
        <div className="mb-5 text-center select-none" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 className="font-[family-name:var(--font-hubballi)] text-[64px] font-normal leading-none tracking-normal text-white flex items-center justify-center" style={{ color: '#ffffff', margin: 0 }}>
            vita<span className="text-[10px] font-sans font-light tracking-wider relative top-[-20px] ml-0.5 opacity-70" style={{ fontSize: '10px', opacity: 0.7 }}>TM</span>
          </h1>
          <p className="mt-1 text-[11px] font-light tracking-[0.2em] text-cyan-200/60 uppercase" style={{ color: 'rgba(165,243,252,0.6)', fontSize: '11px', marginTop: '4px', letterSpacing: '0.2em' }}>
            Activity & Focus Intelligence
          </p>
        </div>

        {/* Main Glass Card Frame */}
        <div className="relative w-full max-w-[412px]" style={{ width: '100%', maxWidth: '412px', position: 'relative' }}>
          {/* Concept Light Refraction Beam */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-full">
            <div className="h-[90px] w-[220px] rounded-full bg-gradient-to-b from-cyan-300/25 via-indigo-400/18 to-transparent blur-[25px] animate-light-beam" />
            <div className="-mt-14 h-[36px] w-[90px] rounded-full bg-gradient-to-b from-white/40 via-cyan-100/25 to-transparent blur-[12px]" />
          </div>

          {/* Glass Card Frame */}
          <div 
            className="relative z-0 min-h-[340px] w-full rounded-[12px] border border-white/12 border-t-white/30 bg-[#16182e]/25 p-7 opacity-[0.96] shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(34,211,238,0.06)] backdrop-blur-[20px] backdrop-saturate-[190%] overflow-hidden"
            style={{ backgroundColor: 'rgba(22, 24, 46, 0.3)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '28px' }}
          >
            {/* Top Glass Edge Refraction Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-[140px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            {/* Error Alert */}
            {error && (
              <div className="mb-4 rounded-[4px] border border-red-500/40 bg-red-950/40 p-2.5 text-center text-[12px] font-medium text-red-200 backdrop-blur-md">
                {error}
              </div>
            )}

            <form action="javascript:void(0);" onSubmit={handleRegisterAccount} className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-5 pt-2">
                <label className="block text-left relative group">
                  <input
                    className="h-10 w-full border-0 border-b border-white/20 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/35 focus:border-cyan-400 focus:ring-0 transition-all duration-200"
                    type="text"
                    name="name"
                    placeholder="Full name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label className="block text-left relative group">
                  <input
                    className="h-10 w-full border-0 border-b border-white/20 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/35 focus:border-cyan-400 focus:ring-0 transition-all duration-200"
                    type="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="block text-left relative group">
                  <input
                    className="h-10 w-full border-0 border-b border-white/20 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/35 focus:border-cyan-400 focus:ring-0 transition-all duration-200"
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="space-y-3.5 pb-1 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-[42px] w-full items-center justify-center space-x-2 rounded-[3px] border border-white/80 bg-gradient-to-r from-white via-slate-100 to-white text-[14px] font-semibold text-black shadow-md transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:scale-[1.005] active:scale-[0.995] cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Creating Account..." : "Create Account & Continue"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>

                <div className="text-center text-[11px] text-white/45 font-light">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-white transition hover:text-white/80 underline-offset-2 hover:underline ml-0.5">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEPS 2 & 3: DASHBOARD CANVAS DESIGN (bg-[#e4e7e4], Soft Card, Zero Scroll)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-[#e4e7e4] text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans antialiased overflow-hidden">
      {/* Top Header: Dashboard Typography */}
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-hubballi)] text-5xl sm:text-6xl font-normal leading-none tracking-tight text-slate-900">
          vita
        </h1>
        <p className="mt-2 text-xs font-normal tracking-[0.2em] text-slate-500 uppercase">
          Activity & Focus Intelligence
        </p>
      </div>

      {/* Main Glass Card Frame (Dashboard Canvas Styling, Zero Scroll) */}
      <div className="w-full max-w-lg bg-[#dcdfdc]/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
        
        {/* Onboarding Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-300/60 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-800 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-slate-900 uppercase">
              {step === 2 && "Step 2: Profile Avatar Setup"}
              {step === 3 && "Step 3: Primary Focus Disciplines"}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {step} of 3
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* STEP 2: PROFILE AVATAR SETUP (DASHBOARD CANVAS DESIGN, ZERO SCROLL) */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Choose Profile Avatar</h2>
              <p className="text-xs text-slate-500 mt-1">Upload a custom photo or pick a studio preset</p>
            </div>

            {/* Main Avatar Preview Circle */}
            <div className="flex justify-center my-4">
              <div className="relative w-24 h-24 rounded-full shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-300 flex items-center justify-center bg-slate-100">
                {customImagePreview ? (
                  <img src={customImagePreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : avatarUrl.startsWith("preset:emerald") ? (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "V"}
                  </div>
                ) : avatarUrl.startsWith("preset:indigo") ? (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-800 flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "V"}
                  </div>
                ) : avatarUrl.startsWith("preset:amber") ? (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "V"}
                  </div>
                ) : avatarUrl.startsWith("preset:obsidian") ? (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "V"}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "V"}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Photo Upload Button */}
            <div className="flex justify-center">
              <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shadow-xs transition">
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Studio Presets */}
            <div>
              <span className="block text-xs font-medium text-slate-500 mb-3">Or Pick a Studio Preset</span>
              <div className="flex items-center justify-center space-x-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === `preset:${preset.id}`;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(`preset:${preset.id}`);
                        setCustomImagePreview(null);
                      }}
                      className={`relative w-11 h-11 rounded-full ${preset.bg} flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isSelected ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-[#dcdfdc] scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
                      }`}
                      title={preset.name}
                    >
                      <UserIcon className="w-4 h-4 text-white" />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
              >
                <span>Continue to Focus Disciplines</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FOCUS DISCIPLINES SETUP (DASHBOARD CANVAS DESIGN, ZERO SCROLL) */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Primary Focus Disciplines</h2>
              <p className="text-xs text-slate-500 mt-1">Calibrates your dashboard tracking categories and session metrics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOCUS_DISCIPLINES.map((disc) => {
                const isSelected = selectedDisciplines.includes(disc.id);
                const Icon = disc.Icon;

                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => toggleDiscipline(disc.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white border-slate-800 shadow-sm text-slate-900"
                        : "bg-white/50 border-slate-200/80 text-slate-600 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-slate-900" : "text-slate-400"}`} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] transition ${
                        isSelected ? "bg-slate-900 border-slate-900 text-white font-bold" : "border-slate-300"
                      }`}>
                        {isSelected && "✓"}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-900">
                        {disc.title}
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                        {disc.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="h-11 px-5 rounded-2xl border border-slate-300 bg-white/80 text-xs font-semibold text-slate-700 hover:bg-white transition cursor-pointer flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-slate-700" />
                Back
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isSubmitting ? "Initializing Studio..." : "Complete Setup & Launch"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
