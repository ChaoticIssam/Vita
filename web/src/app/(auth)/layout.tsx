import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main 
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04050a] px-4 py-8 select-none activity-grid-bg"
      style={{ 
        backgroundColor: '#04050a', 
        color: '#ffffff', 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      {/* Expansive Ambient Background Glow (Digital Activity & Productivity Focus Energy) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Core activity aura 1: Cyan/Indigo Focus Orb */}
        <div className="animate-ambient-pulse absolute -top-[120px] h-[450px] w-[650px] rounded-full bg-gradient-to-b from-cyan-500/18 via-indigo-600/14 to-transparent blur-[100px]" />
        
        {/* Secondary warm telemetry aura */}
        <div className="animate-ambient-pulse absolute top-[20%] h-[320px] w-[420px] rounded-full bg-gradient-to-tr from-amber-300/10 via-purple-600/12 to-transparent blur-[90px]" style={{ animationDelay: '3s' }} />

        {/* Subtle grid Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#04050a_85%)]" />
      </div>

      {/* Main Auth Content Container */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>

      {/* Footer Privacy & Security Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] text-white/30 tracking-wide" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-3.5 h-3.5 text-cyan-400/70 shrink-0"
          style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', display: 'inline-block' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>End-to-End On-Device Encryption & Focus Analytics</span>
      </div>
    </main>
  );
}
