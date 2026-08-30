"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TypewriterSessionLoader } from "@/components/loader/TypewriterSessionLoader";

export { TypewriterSessionLoader };

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
    <div className="h-screen w-screen overflow-hidden bg-[#e4e7e4] text-slate-800 font-sans select-none antialiased">
      {children}
    </div>
  );
}
