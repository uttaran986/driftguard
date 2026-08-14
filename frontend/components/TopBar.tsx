"use client";

import React, { useState, useEffect } from "react";
import { Clock, RefreshCw, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "System Dashboard";
      case "/forecast":
        return "Forecast Demand Analysis";
      case "/drift":
        return "Distribution Drift Monitoring";
      case "/comparison":
        return "Model Comparison Matrix";
      case "/research":
        return "B.Tech Research & Results";
      default:
        return "DriftGuard Control Center";
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-8 py-4 border-b border-gray-900 bg-gray-950/60 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-sky-400" />
        <h1 className="text-lg font-bold tracking-wide text-white uppercase font-sans">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Dynamic Digital Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-400 font-mono text-xs">
          <Clock size={14} className="text-sky-500" />
          <span>{time || "00:00:00"}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-lg transition-all"
        >
          <RefreshCw size={12} className="text-gray-400" />
          <span>Refresh Data</span>
        </button>
      </div>
    </header>
  );
}
