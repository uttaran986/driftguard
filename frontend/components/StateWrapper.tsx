"use client";

import React from "react";
import { AlertCircle, Loader2, RefreshCw, Inbox } from "lucide-react";

interface StateWrapperProps {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export default function StateWrapper({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = "No data available at this time.",
  onRetry,
  children,
}: StateWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[250px] rounded-2xl border border-gray-800/40 bg-gray-950/20 backdrop-blur-sm">
        <div className="relative flex items-center justify-center">
          {/* Inner glowing circle */}
          <div className="absolute w-12 h-12 rounded-full bg-sky-500/10 animate-ping" />
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400 tracking-wider uppercase font-sans animate-pulse">
          Connecting to DriftGuard API...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[250px] rounded-2xl border border-red-950/50 bg-red-950/5 backdrop-blur-md">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4 shadow-lg shadow-red-500/5">
          <AlertCircle size={24} />
        </div>
        <h4 className="text-sm font-bold text-red-200 uppercase tracking-wide">
          Data Acquisition Error
        </h4>
        <p className="mt-2 text-xs text-red-400/80 max-w-md font-sans">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-900/50 hover:bg-red-800/60 border border-red-800 hover:border-red-700 rounded-lg transition-all active:scale-95 shadow-md shadow-red-950/20"
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[250px] rounded-2xl border border-gray-800/40 bg-gray-950/20 backdrop-blur-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-500 mb-4">
          <Inbox size={20} />
        </div>
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
          No Records Found
        </h4>
        <p className="mt-2 text-xs text-gray-500 max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
