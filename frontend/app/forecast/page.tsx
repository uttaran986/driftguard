"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { getPredictions, PredictionRow } from "@/src/lib/api";
import StateWrapper from "@/components/StateWrapper";
import { Calendar, Layers, Activity, TrendingUp, AlertTriangle } from "lucide-react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ForecastPage() {
  const [allPredictions, setAllPredictions] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // 1 = Jan, 12 = Dec
  const [timeWindow, setTimeWindow] = useState<string>("week1"); // 'full', 'week1', 'week2', 'week3', 'week4'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictions();
      if (data && data.predictions) {
        setAllPredictions(data.predictions);
      } else {
        throw new Error("Invalid response format from predictions endpoint.");
      }
    } catch (err: any) {
      setError(
        "Forecast data endpoint unavailable. Connect the forecasting endpoint to display live predictions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on selected month and time window
  const filteredData = useMemo(() => {
    if (!allPredictions.length) return [];

    // 1. Filter by month
    const monthData = allPredictions.filter((p) => p.month === selectedMonth);

    // 2. Filter by time window (hourly)
    if (timeWindow === "full") return monthData;

    const startIdx =
      timeWindow === "week1"
        ? 0
        : timeWindow === "week2"
        ? 168
        : timeWindow === "week3"
        ? 336
        : 504; // week4

    const endIdx = startIdx + 168; // 1 week is 168 hours

    return monthData.slice(startIdx, Math.min(endIdx, monthData.length));
  }, [allPredictions, selectedMonth, timeWindow]);

  // Compute stats on the visible data window
  const stats = useMemo(() => {
    if (!filteredData.length) return { mae: 0, rmse: 0, smape: 0, maxError: 0 };

    let sumAbsError = 0;
    let sumSqError = 0;
    let sumSmape = 0;
    let maxError = 0;

    filteredData.forEach((row) => {
      const err = Math.abs(row.actual - row.prediction);
      sumAbsError += err;
      sumSqError += err * err;

      const denom = (Math.abs(row.actual) + Math.abs(row.prediction)) / 2;
      if (denom > 0) {
        sumSmape += (err / denom) * 100;
      }

      if (err > maxError) maxError = err;
    });

    const len = filteredData.length;
    return {
      mae: sumAbsError / len,
      rmse: Math.sqrt(sumSqError / len),
      smape: sumSmape / len,
      maxError,
    };
  }, [filteredData]);

  // Formatter for demand values (MW)
  const formatMW = (value: number) => {
    return `${(value / 1000).toFixed(1)}k MW`;
  };

  // Tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const errorVal = Math.abs(data.actual - data.prediction);
      const errorPercent = (errorVal / data.actual) * 100;

      return (
        <div className="rounded-xl border border-gray-800 bg-gray-950/95 backdrop-blur-md p-4 text-xs shadow-2xl">
          <p className="font-bold text-white mb-2">{data.timestamp}</p>
          <div className="space-y-1 text-gray-400 font-mono">
            <p className="flex justify-between gap-6">
              <span>Actual Load:</span>
              <span className="font-semibold text-sky-400">{data.actual.toFixed(2)} MW</span>
            </p>
            <p className="flex justify-between gap-6">
              <span>Predicted Load:</span>
              <span className="font-semibold text-indigo-400">{data.prediction.toFixed(2)} MW</span>
            </p>
            <div className="border-t border-gray-900 my-2 pt-2 flex justify-between gap-6 text-gray-500">
              <span>Variance:</span>
              <span className="font-semibold text-rose-400">
                {errorVal.toFixed(2)} MW ({errorPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Filters header card */}
      <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
            Forecasting Explorer
          </h2>
          <p className="text-xs text-gray-500">
            Interactive timeline of model predictions against observed demand values
          </p>
        </div>

        {/* Filters inputs */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Month select */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900/40">
            <Calendar size={14} className="text-sky-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs text-gray-300 font-semibold focus:outline-none cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-gray-950 text-gray-300">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Time range toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-900/60 border border-gray-850">
            {[
              { id: "week1", label: "Week 1" },
              { id: "week2", label: "Week 2" },
              { id: "week3", label: "Week 3" },
              { id: "week4", label: "Week 4" },
              { id: "full", label: "Full Month" },
            ].map((win) => (
              <button
                key={win.id}
                onClick={() => setTimeWindow(win.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${
                  timeWindow === win.id
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {win.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <StateWrapper isLoading={loading} error={error} onRetry={fetchData}>
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl border border-gray-900 bg-gray-950/40 p-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Visible MAE
            </p>
            <p className="mt-1 text-xl font-bold font-mono text-white">
              {stats.mae.toFixed(4)}
            </p>
            <p className="text-[10px] text-gray-600 mt-1 font-sans">
              Mean absolute error in window
            </p>
          </div>

          <div className="rounded-xl border border-gray-900 bg-gray-950/40 p-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Visible RMSE
            </p>
            <p className="mt-1 text-xl font-bold font-mono text-white">
              {stats.rmse.toFixed(4)}
            </p>
            <p className="text-[10px] text-gray-600 mt-1 font-sans">
              Root mean squared error in window
            </p>
          </div>

          <div className="rounded-xl border border-gray-900 bg-gray-950/40 p-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Visible sMAPE
            </p>
            <p className="mt-1 text-xl font-bold font-mono text-white">
              {stats.smape.toFixed(4)}%
            </p>
            <p className="text-[10px] text-gray-600 mt-1 font-sans">
              Symmetric percentage error in window
            </p>
          </div>

          <div className="rounded-xl border border-gray-900 bg-gray-950/40 p-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Peak Error Deviation
            </p>
            <p className="mt-1 text-xl font-bold font-mono text-rose-400">
              {stats.maxError.toFixed(2)} MW
            </p>
            <p className="text-[10px] text-gray-600 mt-1 font-sans">
              Maximum absolute variance
            </p>
          </div>
        </div>

        {/* Main Forecasting Area Chart */}
        <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 shadow-2xl h-[500px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-sky-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Predicted vs Actual Load
              </h3>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-sky-500 inline-block" />
                <span className="text-gray-400">Observed Demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" />
                <span className="text-gray-400">Model Forecast</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    // Show only date and hour
                    if (!val) return "";
                    const parts = val.split(" ");
                    if (parts.length < 2) return val;
                    const datePart = parts[0].substring(5); // MM-DD
                    const hourPart = parts[1].substring(0, 5); // HH:MM
                    return `${datePart} ${hourPart}`;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatMW}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#0ea5e9"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#actualGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="prediction"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#predictedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub Error Trend Line Chart */}
        <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 shadow-2xl h-[280px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-rose-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Absolute Prediction Error Trajectory
              </h3>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Instantaneous absolute error |Actual - Predicted| in MW
            </p>
          </div>

          <div className="flex-1 w-full min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (!val) return "";
                    const parts = val.split(" ");
                    return parts.length >= 2 ? parts[1].substring(0, 5) : val;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(2)} MW`, "Absolute Error"]}
                  labelClassName="text-gray-500 font-bold"
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey={(row) => Math.abs(row.actual - row.prediction)}
                  stroke="#f43f5e"
                  strokeWidth={1}
                  dot={false}
                  name="Error"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StateWrapper>
    </div>
  );
}
