"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Activity,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Server,
  Zap
} from "lucide-react";
import { checkBackendHealth } from "@/src/lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Monitor backend connection health
  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const response = await checkBackendHealth();
        if (response && response.status === "healthy") {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        setIsConnected(false);
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 10000); // Check health every 10s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Forecast Analysis",
      path: "/forecast",
      icon: LineChart,
    },
    {
      name: "Drift Monitoring",
      path: "/drift",
      icon: Activity,
    },
    {
      name: "Model Comparison",
      path: "/comparison",
      icon: BarChart3,
    },
    {
      name: "Research Results",
      path: "/research",
      icon: BookOpen,
    },
  ];

  return (
    <aside
      className={`sticky top-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col bg-gray-950/80 backdrop-blur-xl border-r border-gray-800/40 text-white shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-850">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/10">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-sans">
              DriftGuard
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-gray-800 hover:bg-gray-900 transition-colors text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-sky-950/50 to-indigo-950/30 border border-sky-900/50 text-white shadow-inner"
                  : "text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-sky-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium tracking-wide font-sans">
                  {item.name}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <span className="absolute left-0 w-1 h-6 rounded-r bg-sky-500" />
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-gray-800">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer with Health Check Status */}
      <div className="p-4 border-t border-gray-850">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border bg-gray-900/20 ${
            isConnected === true
              ? "border-emerald-950 bg-emerald-950/5"
              : isConnected === false
              ? "border-red-950 bg-red-950/5"
              : "border-gray-850"
          }`}
        >
          <div className="flex items-center justify-center shrink-0">
            <Server
              className={`w-4 h-4 ${
                isConnected === true
                  ? "text-emerald-400 animate-pulse"
                  : isConnected === false
                  ? "text-red-400 animate-pulse"
                  : "text-gray-500"
              }`}
            />
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                System Status
              </p>
              <p
                className={`text-xs font-bold truncate flex items-center gap-1.5 ${
                  isConnected === true
                    ? "text-emerald-400"
                    : isConnected === false
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isConnected === true
                      ? "bg-emerald-400"
                      : isConnected === false
                      ? "bg-red-400"
                      : "bg-gray-500"
                  }`}
                />
                {isConnected === true
                  ? "Connected"
                  : isConnected === false
                  ? "Offline"
                  : "Connecting..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
