"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top Header: Logo & Concept Tagline */}
      <div className="mb-6 text-center select-none" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 className="font-[family-name:var(--font-hubballi)] text-[64px] font-normal leading-none tracking-normal text-white flex items-center justify-center" style={{ color: '#ffffff', margin: 0 }}>
          vita<span className="text-[10px] font-sans font-light tracking-wider relative top-[-20px] ml-0.5 opacity-70" style={{ fontSize: '10px', opacity: 0.7 }}>TM</span>
        </h1>
        <p className="mt-1 text-[11px] font-light tracking-[0.2em] text-cyan-200/60 uppercase" style={{ color: 'rgba(165,243,252,0.6)', fontSize: '11px', marginTop: '4px', letterSpacing: '0.2em' }}>
          Activity & Focus Intelligence
        </p>
      </div>

      {/* Frame 2: Glass Card Container with Enhanced Activity Refraction Light */}
      <div className="relative w-full max-w-[412px]" style={{ width: '100%', maxWidth: '412px', position: 'relative' }}>
        {/* Concept-Enhanced Light Refraction Beam */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-full">
          <div className="h-[90px] w-[220px] rounded-full bg-gradient-to-b from-cyan-300/25 via-indigo-400/18 to-transparent blur-[25px] animate-light-beam" />
          <div className="-mt-14 h-[36px] w-[90px] rounded-full bg-gradient-to-b from-white/40 via-cyan-100/25 to-transparent blur-[12px]" />
        </div>

        {/* Glass Card Frame */}
        <div 
          className="relative z-0 min-h-[290px] w-full rounded-[12px] border border-white/12 border-t-white/30 bg-[#16182e]/25 p-7 opacity-[0.96] shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(34,211,238,0.06)] backdrop-blur-[20px] backdrop-saturate-[190%] transition-all duration-300 hover:border-white/20"
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

          <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="space-y-6 pt-2">
              <label className="block text-left relative group" style={{ display: 'block', width: '100%', marginBottom: '20px' }}>
                <input
                  className="h-10 w-full border-0 border-b border-white/20 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/35 focus:border-cyan-400 focus:ring-0 transition-all duration-200"
                  type="text"
                  name="email"
                  placeholder="Email / Mobile Number"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', height: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', outline: 'none' }}
                />
              </label>

              <label className="block text-left relative group" style={{ display: 'block', width: '100%' }}>
                <input
                  className="h-10 w-full border-0 border-b border-white/20 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/35 focus:border-cyan-400 focus:ring-0 transition-all duration-200"
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', height: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', outline: 'none' }}
                />
              </label>
            </div>

            <div className="space-y-3.5 pb-1 mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[42px] w-full items-center justify-center rounded-[3px] border border-white/80 bg-gradient-to-r from-white via-slate-100 to-white text-[14px] font-semibold text-black shadow-md transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:scale-[1.005] active:scale-[0.995] cursor-pointer disabled:opacity-50"
                style={{ width: '100%', height: '42px', backgroundColor: '#ffffff', color: '#000000', borderRadius: '3px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.8)' }}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div className="text-center text-[11px] text-white/45 font-light" style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                No account yet?{' '}
                <Link href="/register" className="font-semibold text-white transition hover:text-white/80 underline-offset-2 hover:underline ml-0.5" style={{ color: '#ffffff', fontWeight: 600 }}>
                  Signup
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
