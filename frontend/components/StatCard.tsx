"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  explanation: string;
  icon: LucideIcon;
  colorClass?: string;
}

export default function StatCard({
  title,
  value,
  explanation,
  icon: Icon,
  colorClass = "text-sky-400 border-sky-500/20 bg-sky-950/5",
}: StatCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-gray-900 bg-gray-950/40 p-6 transition-all duration-300 hover:border-gray-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/5">
      {/* Background glow hover effect */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600/10 to-indigo-600/5 blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold font-mono tracking-tight text-white group-hover:text-sky-300 transition-colors">
            {typeof value === "number" ? value.toFixed(4) : value}
          </h3>
        </div>

        <div className={`p-2.5 rounded-xl border ${colorClass} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400/80 leading-relaxed font-sans">
        {explanation}
      </p>
    </div>
  );
}
