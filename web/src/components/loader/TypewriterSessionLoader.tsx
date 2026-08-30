"use client";

import React, { useState, useEffect } from "react";

export function TypewriterSessionLoader() {
  const [displayText, setDisplayText] = useState("v");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "vita";

  useEffect(() => {
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
      <div className="flex items-center text-3xl sm:text-4xl font-normal tracking-normal text-slate-800 font-[family-name:var(--font-hubballi)]">
        <span>{displayText}</span>
        <span className="ml-0.5 inline-block h-5 sm:h-6 w-[2px] bg-slate-700 animate-pulse" />
      </div>
    </div>
  );
}
