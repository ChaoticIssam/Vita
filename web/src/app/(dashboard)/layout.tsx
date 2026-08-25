"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function TypewriterSessionLoader() {
  const [displayText, setDisplayText] = React.useState("v");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fullText = "vita";

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isDeleting && displayText.length < fullText.length) {
      timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 70);
    } else if (!isDeleting && displayText.length === fullText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 240);
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length - 1));
      }, 40);
    } else if (isDeleting && displayText.length === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, 60);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#e4e7e4] select-none font-mono animate-page-entrance transition-all duration-300">
      <div className="flex items-center text-xl sm:text-2xl font-semibold tracking-normal text-slate-700">
        <span>{displayText}</span>
        <span className="ml-0.5 inline-block h-5 sm:h-6 w-[2px] bg-slate-700 animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <TypewriterSessionLoader />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#e4e7e4] text-slate-800 font-sans select-none antialiased animate-page-entrance transition-opacity duration-300">
      {children}
    </div>
  );
}
