import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vita",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(39,47,88,0.28),_transparent_42%),linear-gradient(180deg,_#07111f_0%,_#0b1320_44%,_#f4f6fb_44%,_#f4f6fb_100%)] text-slate-950">
        {children}
      </body>
    </html>
  );
}
