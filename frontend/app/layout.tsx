import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DriftGuard — Adaptive Forecasting & Drift Detection",
  description: "AI-powered electricity demand forecasting and model drift monitoring control center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-gray-950 text-white font-sans antialiased flex">
        <div className="flex w-full min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {/* pl-20 is a safe fallback for absolute positioning on small screens */}
            <TopBar />
            <main className="flex-1 p-6 md:p-8 bg-gray-950/20">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

