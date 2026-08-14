"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  Award,
  Zap,
  RotateCw,
  Target,
  Percent,
  TrendingUp,
  ChevronRight,
  Database,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  getMetrics,
  getModelComparison,
  GlobalMetrics,
  ModelComparison
} from "@/src/lib/api";
import StatCard from "@/components/StatCard";
import StateWrapper from "@/components/StateWrapper";
import MonthlyMAEChart from "@/components/MonthlyMAEChart";
import MonthlyImprovementChart from "@/components/MonthlyImprovementChart";

// Dynamically import 3D components with SSR disabled to prevent hydration errors
const EnergyCore = dynamic(() => import("@/components/EnergyCore"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] lg:h-[500px] w-full bg-gray-950/40 border border-gray-900 rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-3">
      <RotateCw className="w-6 h-6 animate-spin text-sky-500" />
      <span className="text-xs font-mono tracking-widest uppercase">Initializing 3D Core Canvas...</span>
    </div>
  ),
});

const ModelComparison3D = dynamic(() => import("@/components/ModelComparison3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-gray-950/40 border border-gray-900 rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-3">
      <RotateCw className="w-6 h-6 animate-spin text-sky-500" />
      <span className="text-xs font-mono tracking-widest uppercase">Loading 3D Benchmark Engine...</span>
    </div>
  ),
});

const MonthlyImprovement3D = dynamic(() => import("@/components/MonthlyImprovement3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-gray-950/40 border border-gray-900 rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-3">
      <RotateCw className="w-6 h-6 animate-spin text-sky-500" />
      <span className="text-xs font-mono tracking-widest uppercase">Rendering 3D Monthly Columns...</span>
    </div>
  ),
});

// Static fallback data if API endpoints fail to load
const fallbackMetrics: GlobalMetrics = {
  model: "Adaptive DriftGuard V3",
  mae: 3817.8330,
  rmse: 5557.0440,
  r2: 0.993392,
  smape: 1.762840,
  retraining_events: 7,
};

const fallbackComparison: ModelComparison[] = [
  {
    model: "Static Model",
    mae: 3898.3948,
    rmse: 5828.8307,
    r2: 0.9947,
    smape: 1.8000,
    retraining_events: 0,
    mae_improvement: 0.0000,
    rmse_improvement: 0.0000,
  },
  {
    model: "Periodic Retraining",
    mae: 3893.8152,
    rmse: 5830.1407,
    r2: 0.9947,
    smape: 1.8017,
    retraining_events: 4,
    mae_improvement: 0.1175,
    rmse_improvement: -0.0225,
  },
  {
    model: "One-Time DriftGuard",
    mae: 3867.5332,
    rmse: 5815.2680,
    r2: 0.9947,
    smape: 1.7874,
    retraining_events: 1,
    mae_improvement: 0.7916,
    rmse_improvement: 0.2327,
  },
  {
    model: "Adaptive DriftGuard V3",
    mae: 3817.8330,
    rmse: 5557.0440,
    r2: 0.993392,
    smape: 1.762840,
    retraining_events: 7,
    mae_improvement: 2.0665,
    rmse_improvement: 4.6628,
  },
];

const monthlyImprovementValues = [
  { month: 1, monthName: "January", improvement: 0.000000 },
  { month: 2, monthName: "February", improvement: 4.219837 },
  { month: 3, monthName: "March", improvement: 8.122146 },
  { month: 4, monthName: "April", improvement: -2.901826 },
  { month: 5, monthName: "May", improvement: 4.317903 },
  { month: 6, monthName: "June", improvement: 5.252008 },
  { month: 7, monthName: "July", improvement: 0.410652 },
  { month: 8, monthName: "August", improvement: -1.194648 },
  { month: 9, monthName: "September", improvement: 0.495226 },
  { month: 10, monthName: "October", improvement: 0.107020 },
  { month: 11, monthName: "November", improvement: -1.467425 },
  { month: 12, monthName: "December", improvement: 6.717769 },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [comparison, setComparison] = useState<ModelComparison[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Tab selections for 2D vs 3D charts
  const [comparisonView, setComparisonView] = useState<"2d" | "3d">("3d");
  const [improvementView, setImprovementView] = useState<"2d" | "3d">("3d");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      const [fetchedMetrics, fetchedComparison] = await Promise.all([
        getMetrics(),
        getModelComparison(),
      ]);
      setMetrics(fetchedMetrics);
      setComparison(fetchedComparison);
    } catch (err: any) {
      console.warn("Could not query backend endpoints. Falling back to local research data.", err);
      setMetrics(fallbackMetrics);
      setComparison(fallbackComparison);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        {/* Hero Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/20 text-xs font-semibold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Adaptive Control Panel
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight font-sans">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
                DriftGuard
              </span>
            </h1>
            <p className="text-lg font-bold text-sky-400/90 tracking-wide font-sans">
              Adaptive Electricity Demand Forecasting & Drift Detection System
            </p>
          </div>

          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Detect distribution shifts in real-time. Retrain ML forecasting weights
            adaptively when concept drift degrades predictability. Track and validate prediction reliability.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                const element = document.getElementById("kpi-grid");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Explore Dashboard
            </button>
            <Link
              href="/research"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900/60 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 text-gray-300 hover:text-white"
            >
              <span>View Research Results</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3D Visual Hero */}
        <div className="lg:col-span-5 relative w-full">
          <EnergyCore />
        </div>
      </section>

      {/* 2. SYSTEM STATUS & OFFLINE ALERTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection status overlay */}
        <div className="md:col-span-2 rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Database size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                Target Backend Gateway
              </h4>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                FastAPI Host: http://127.0.0.1:8000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isOffline ? (
              <>
                <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                  <XCircle size={14} className="animate-pulse" />
                  Local Connection Offline
                </span>
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-lg border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 text-[10px] font-bold text-rose-300 transition-colors uppercase tracking-wider"
                >
                  Retry Connection
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <CheckCircle2 size={14} className="animate-pulse" />
                Live Node Synchronized
              </span>
            )}
          </div>
        </div>

        {/* Glass Card System Status */}
        <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-6 flex flex-col justify-between">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            System Status
          </p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-emerald-400 tracking-wider">
              ● ONLINE
            </span>
            <span className="text-[10px] text-gray-600 font-mono">
              EVALUATION PERIOD: 2014
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-900 pt-3 text-xs text-gray-400">
            <div>
              <p className="text-[10px] text-gray-600 uppercase">API Status</p>
              <p className="font-bold text-white mt-0.5">{isOffline ? "LOCAL_OFFLINE" : "HEALTHY"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase">Evaluation Records</p>
              <p className="font-bold text-white mt-0.5 font-mono">8,760 hrs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KPI METRIC SECTION */}
      <section id="kpi-grid" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
            Model Performance KPIs
          </h2>
          <span className="text-xs text-gray-500">
            Current Target: <strong className="text-sky-400">Adaptive DriftGuard V3</strong>
          </span>
        </div>

        <StateWrapper isLoading={loading && !metrics} error={null}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Mean Absolute Error (MAE)"
              value={metrics?.mae ?? fallbackMetrics.mae}
              explanation="Mean absolute deviance in MW forecasting."
              icon={Activity}
              colorClass="text-sky-400 border-sky-500/20 bg-sky-950/5"
            />
            <StatCard
              title="Root Mean Squared Error (RMSE)"
              value={metrics?.rmse ?? fallbackMetrics.rmse}
              explanation="Amplified penalization for major peak-load errors."
              icon={TrendingUp}
              colorClass="text-indigo-400 border-indigo-500/20 bg-indigo-950/5"
            />
            <StatCard
              title="R-Squared (R²)"
              value={metrics?.r2 ?? fallbackMetrics.r2}
              explanation="Explained variance metric indicating forecasting fit."
              icon={Target}
              colorClass="text-emerald-400 border-emerald-500/20 bg-emerald-950/5"
            />
            <StatCard
              title="sMAPE"
              value={`${(metrics?.smape ?? fallbackMetrics.smape).toFixed(4)}%`}
              explanation="Symmetric mean absolute percentage error accuracy."
              icon={Percent}
              colorClass="text-rose-400 border-rose-500/20 bg-rose-950/5"
            />
            <StatCard
              title="Retraining Events"
              value={metrics?.retraining_events ?? fallbackMetrics.retraining_events}
              explanation="Drift-triggered retraining interventions over 2014."
              icon={RotateCw}
              colorClass="text-amber-400 border-amber-500/20 bg-amber-950/5"
            />
          </div>
        </StateWrapper>
      </section>

      {/* 4. MODEL COMPARISON SECTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Benchmarks & Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
              Retraining Strategies Benchmarks
            </h2>
            <div className="flex gap-1.5 p-1 rounded-lg bg-gray-900 border border-gray-800">
              <button
                onClick={() => setComparisonView("2d")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                  comparisonView === "2d"
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                2D Matrix
              </button>
              <button
                onClick={() => setComparisonView("3d")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                  comparisonView === "3d"
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                3D Chart
              </button>
            </div>
          </div>

          {comparisonView === "3d" ? (
            <ModelComparison3D data={comparison ?? fallbackComparison} />
          ) : (
            <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 uppercase font-semibold">
                    <th className="pb-3 pr-4">Model Retraining Protocol</th>
                    <th className="pb-3 pr-4 text-right">MAE</th>
                    <th className="pb-3 pr-4 text-right">RMSE</th>
                    <th className="pb-3 pr-4 text-right">R²</th>
                    <th className="pb-3 pr-4 text-right">sMAPE</th>
                    <th className="pb-3 text-right">Retrains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 text-gray-300">
                  {(comparison ?? fallbackComparison).map((row) => {
                    const isV3 = row.model === "Adaptive DriftGuard V3";
                    return (
                      <tr
                        key={row.model}
                        className={`transition-colors hover:bg-gray-900/20 ${
                          isV3 ? "bg-emerald-950/10 text-emerald-400 font-bold" : ""
                        }`}
                      >
                        <td className="py-4 pr-4">{row.model}</td>
                        <td className="py-4 pr-4 text-right font-mono">{row.mae.toFixed(4)}</td>
                        <td className="py-4 pr-4 text-right font-mono">{row.rmse.toFixed(4)}</td>
                        <td className="py-4 pr-4 text-right font-mono">{row.r2.toFixed(4)}</td>
                        <td className="py-4 pr-4 text-right font-mono">{row.smape.toFixed(4)}%</td>
                        <td className="py-4 text-right font-mono">{row.retraining_events}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-xs text-emerald-400/90 leading-relaxed">
                🚀 <strong>Adaptive DriftGuard V3 Highlights:</strong> MAE improved by{" "}
                <strong>2.0665%</strong> and RMSE improved by <strong>4.6628%</strong> compared to the baseline Static Model, using only 7 retraining updates.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Research Findings & Statistical Validation */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
            Statistical Validation
          </h2>

          {/* Wilcoxon Signed-Rank Test Glass Card */}
          <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Wilcoxon Signed-Rank Test
                </h4>
                <p className="text-[10px] text-gray-500">
                  Static MAE vs Adaptive V3 MAE
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-gray-900 py-3 font-mono text-xs">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Test Statistic</p>
                <p className="font-bold text-white mt-0.5">16.0000</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Asymptotic p-value</p>
                <p className="font-bold text-amber-400 mt-0.5">0.147461</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-950 text-rose-400 border border-rose-900/50">
                Not Statistically Significant
              </span>
              <p className="text-gray-400 leading-relaxed text-xs">
                Adaptive V3 achieved better numerical performance, but the statistical test did not establish significance (p &gt; 0.05).
              </p>
              <p className="text-[10px] text-gray-500 italic">
                Conclusion: The null hypothesis (no median difference in forecast errors) cannot be rejected at standard confidence levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MONTHLY PERFORMANCE TRENDS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
            Monthly Performance & Impact
          </h2>
          <div className="flex gap-1.5 p-1 rounded-lg bg-gray-900 border border-gray-800">
            <button
              onClick={() => setImprovementView("2d")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                improvementView === "2d"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              2D Charts
            </button>
            <button
              onClick={() => setImprovementView("3d")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                improvementView === "3d"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-white"
                }`}
            >
              3D Chart
            </button>
          </div>
        </div>

        {improvementView === "3d" ? (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <MonthlyImprovement3D data={monthlyImprovementValues} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyMAEChart />
            <MonthlyImprovementChart />
          </div>
        )}
      </section>

      {/* 6. DRIFT MONITORING PREVIEW */}
      <section className="rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-6 shadow-2xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest font-mono">
              Signal Processing Layer
            </span>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans mt-0.5">
              Distribution Drift Monitoring
            </h2>
            <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Drift is detected when the monitored feature distribution differs significantly from the reference distribution.
              The system employs Kolmogorov-Smirnov (KS) tests on incoming demand shapes.
            </p>
          </div>
          <Link
            href="/drift"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/60 font-bold text-xs uppercase tracking-wider transition-colors text-white"
          >
            <span>Open Monitor Control</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-gray-900 pt-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Statistical Thresholds
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-900 bg-gray-900/20">
                <p className="text-[10px] text-gray-500 uppercase">KS Distance Limit</p>
                <p className="text-lg font-bold text-sky-400 font-mono mt-1">0.1</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-900 bg-gray-900/20">
                <p className="text-[10px] text-gray-500 uppercase">Significance Alpha</p>
                <p className="text-lg font-bold text-sky-400 font-mono mt-1">0.05</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 leading-relaxed text-gray-400">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Interpretation Summary
            </h4>
            <p>
              Concept drift and feature distribution shift are primary indicators of forecasting degradation.
              The KS threshold flags months with significant anomalies (KS &gt; 0.1, p-value &lt; 0.05).
            </p>
            <p className="text-[10px] text-gray-500">
              Note: The correlation analysis between drift intensity (KS statistic) and forecasting error (MAE) is evaluated in the Drift Monitoring page.
            </p>
          </div>
        </div>
      </section>

      {/* 7. RESEARCH SUMMARY & B.TECH CONCLUSION */}
      <section className="rounded-2xl border border-gray-900 bg-gray-950/60 p-8 space-y-6 shadow-2xl">
        <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans border-b border-gray-900 pb-4">
          Research Findings Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Target Objective
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              To design an event-driven adaptive retraining strategy that balances prediction performance (MAE/RMSE improvements) against computation cost (total retraining frequency).
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              System Retraining Overhead
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Adaptive DriftGuard V3 achieved the lowest forecasting error margins among evaluated models while keeping training triggers bound to drift occurrences (7 events compared to continuous periodic methods).
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Key Results
            </h4>
            <ul className="text-xs text-gray-400 space-y-1.5 font-sans">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Overall MAE improvement: <strong>2.0665%</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Overall RMSE improvement: <strong>4.6628%</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Improved months: <strong>8 / 12</strong></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wide">
            Final Research Conclusion
          </h4>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Adaptive DriftGuard V3 achieved the lowest overall MAE and RMSE among the evaluated retraining strategies while using event-driven adaptive retraining. However, the Wilcoxon signed-rank test did not establish statistically significant improvement (p = 0.1475). This indicates that while the numerical gains are clear, the statistical variance is too large to confidently reject the null hypothesis on this sample size.
          </p>
        </div>
      </section>
    </div>
  );
}