import type { Metadata } from "next";
import { Geist, Geist_Mono, Hubballi } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hubballi = Hubballi({
  weight: "400",
  variable: "--font-hubballi",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vita - Activity & Focus Intelligence",
  description: "Activity insights, goals, and focus tracking for Vita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hubballi.variable} h-full antialiased bg-[#04050a]`}
      style={{ backgroundColor: '#04050a', color: '#ffffff' }}
    >
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* data: blob:;"
        />
        {/* Critical zero-latency inline CSS: Runs on frame 0 before external CSS or JS loads */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background-color: #04050a !important;
            color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100vh !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          input, button {
            font-family: inherit;
          }
        ` }} />
      </head>
      <body 
        className="min-h-full bg-[#04050a] text-slate-100 font-sans antialiased"
        style={{ backgroundColor: '#04050a', color: '#ffffff', minHeight: '100vh', margin: 0, padding: 0 }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
