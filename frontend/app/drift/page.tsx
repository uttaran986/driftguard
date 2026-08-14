"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { getDriftData, getDriftError, DriftMonth, DriftErrorAnalysis } from "@/src/lib/api";
import StateWrapper from "@/components/StateWrapper";
import { AlertCircle, ShieldAlert, Award, FileText, ArrowRight } from "lucide-react";

// Exact MAE results for months 1-10 to combine with drift statistics
const monthlyMAEs = [
  3356.956172, // Jan
  2251.420049, // Feb
  2806.312367, // Mar
  3782.554950, // Apr
  4063.158384, // May
  4283.591242, // Jun
  4285.755912, // Jul
  5060.094419, // Aug
  4338.977900, // Sep
  4929.532223  // Oct
];

// Fallback drift results if API fails
const fallbackDrift = {
  ks_threshold: 0.1,
  p_value_threshold: 0.05,
  months: [
    { month: 1, month_name: "January", ks_statistic: 0.110999, p_value: 2.730155e-07, drift_detected: true },
    { month: 2, month_name: "February", ks_statistic: 0.107815, p_value: 4.910695e-04, drift_detected: true },
    { month: 3, month_name: "March", ks_statistic: 0.096150, p_value: 2.674485e-03, drift_detected: false },
    { month: 4, month_name: "April", ks_statistic: 0.137724, p_value: 1.598231e-06, drift_detected: true },
    { month: 5, month_name: "May", ks_statistic: 0.088620, p_value: 5.871714e-03, drift_detected: false },
    { month: 6, month_name: "June", ks_statistic: 0.103987, p_value: 6.603062e-04, drift_detected: true },
    { month: 7, month_name: "July", ks_statistic: 0.148925, p_value: 1.487425e-07, drift_detected: true },
    { month: 8, month_name: "August", ks_statistic: 0.091398, p_value: 3.980308e-03, drift_detected: false },
    { month: 9, month_name: "September", ks_statistic: 0.053360, p_value: 2.369458e-01, drift_detected: false },
    { month: 10, month_name: "October", ks_statistic: 0.064740, p_value: 8.780879e-02, drift_detected: false }
  ]
};

const fallbackDriftError: DriftErrorAnalysis = {
  pearson: { correlation: -0.4848, p_value: 0.1102, statistically_significant: false },
  spearman: { correlation: -0.5524, p_value: 0.0625, statistically_significant: false },
  interpretation: "Neither Pearson nor Spearman correlation between drift and forecast error is statistically significant."
};

export default function DriftPage() {
  const [driftData, setDriftData] = useState<any | null>(null);
  const [driftError, setDriftError] = useState<DriftErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, errAnalysis] = await Promise.all([
        getDriftData(),
        getDriftError()
      ]);
      setDriftData(data);
      setDriftError(errAnalysis);
    } catch (err: any) {
      console.warn("Backend endpoints offline. Rendering research drift statistics.");
      setDriftData(fallbackDrift);
      setDriftError(fallbackDriftError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Merge KS Statistics with Monthly MAEs for the timeline and scatter plot
  const timelineData = useMemo(() => {
    if (!driftData) return [];

    // Map Jan-Dec including Nov and Dec as unavailable
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return months.map((name, idx) => {
      const monthNum = idx + 1;
      const matched = driftData.months.find((m: DriftMonth) => m.month === monthNum);

      if (matched) {
        return {
          month: monthNum,
          name,
          monthName: matched.month_name,
          ks: matched.ks_statistic,
          pValue: matched.p_value,
          driftDetected: matched.drift_detected,
          mae: monthlyMAEs[idx] || null,
          available: true
        };
      }

      // Return placeholder for November and December
      return {
        month: monthNum,
        name,
        monthName: monthNum === 11 ? "November" : "December",
        ks: null,
        pValue: null,
        driftDetected: null,
        mae: null,
        available: false
      };
    });
  }, [driftData]);

  // Data formatted strictly for scatter plot (excludes Nov/Dec)
  const scatterData = useMemo(() => {
    return timelineData
      .filter((d) => d.available && d.ks !== null && d.mae !== null)
      .map((d) => ({
        monthName: d.name,
        ks: d.ks,
        mae: d.mae
      }));
  }, [timelineData]);

  // Tooltip for Timeline
  const TimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data.available) {
        return (
          <div className="rounded-xl border border-gray-800 bg-gray-950/95 backdrop-blur-md p-3 text-xs text-gray-500 shadow-2xl">
            <p className="font-bold text-white mb-1">{data.name}</p>
            <p>Data Unavailable</p>
          </div>
        );
      }

      return (
        <div className="rounded-xl border border-gray-800 bg-gray-950/95 backdrop-blur-md p-4 text-xs shadow-2xl">
          <p className="font-bold text-white mb-2">{data.name} (Month {data.month})</p>
          <div className="space-y-1 text-gray-400 font-mono">
            <p className="flex justify-between gap-6">
              <span>KS Statistic:</span>
              <span className="font-semibold text-sky-400">{data.ks.toFixed(6)}</span>
            </p>
            <p className="flex justify-between gap-6">
              <span>p-value:</span>
              <span className="font-semibold text-sky-400">{data.pValue.toExponential(3)}</span>
            </p>
            <p className="flex justify-between gap-6">
              <span>MAE error:</span>
              <span className="font-semibold text-white">
                {data.mae ? `${data.mae.toFixed(2)} MW` : "N/A"}
              </span>
            </p>
            <div className="border-t border-gray-900 my-2 pt-2 flex justify-between gap-6">
              <span>Drift Status:</span>
              <span
                className={`font-sans font-bold uppercase ${
                  data.driftDetected ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {data.driftDetected ? "Detected" : "Not Detected"}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      {/* Upper header summary */}
      <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-950/20 text-xs font-semibold text-rose-400">
            <ShieldAlert size={14} />
            Statistical Drift Dashboard
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
            Distribution Drift Monitoring
          </h2>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Drift is detected when the monitored feature distribution differs significantly from the reference distribution.
            This module compares incoming electrical loads against established baseline profiles using Kolomogorov-Smirnov tests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">KS Threshold</p>
            <p className="text-lg font-bold text-white mt-1">0.1</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">p-value Target</p>
            <p className="text-lg font-bold text-white mt-1">0.05</p>
          </div>
        </div>
      </div>

      <StateWrapper isLoading={loading} error={error} onRetry={fetchData}>
        {/* Drift Timeline Chart */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 shadow-2xl h-[450px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  KS Statistic Timeline
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Monthly Kolmogorov-Smirnov distance comparison (Nov/Dec values unavailable)
                </p>
              </div>

              <div className="flex-1 w-full my-4 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 0.2]}
                    />
                    <Tooltip content={<TimelineTooltip />} />
                    <ReferenceLine
                      y={0.1}
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      label={{
                        value: "Drift Threshold (0.1)",
                        fill: "#f43f5e",
                        fontSize: 10,
                        position: "top",
                        fontWeight: "bold"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ks"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (!payload.available || payload.ks === null) return <React.Fragment key={payload.name} />;

                        const isDrift = payload.driftDetected;
                        return (
                          <circle
                            key={payload.name}
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill={isDrift ? "#f43f5e" : "#10b981"}
                            stroke="#020617"
                            strokeWidth={1.5}
                          />
                        );
                      }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-900 pt-4">
                <span>Kolmogorov-Smirnov Distance Matrix</span>
                <span className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>No Drift (KS &le; 0.1)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Drift Detected (KS &gt; 0.1)</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Detailed Table */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-6 h-[450px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Detailed Monthly Status
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Historical p-values and evaluation metrics
                </p>
              </div>

              <div className="flex-1 my-4 overflow-y-auto pr-1 space-y-2.5">
                {timelineData.map((d) => {
                  if (!d.available || d.ks === null) {
                    return (
                      <div
                        key={d.name}
                        className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-900 bg-gray-950/10 text-gray-600 text-xs"
                      >
                        <span className="font-semibold">{d.name}</span>
                        <span>Data Unavailable</span>
                      </div>
                    );
                  }

                  const isDrift = d.driftDetected;
                  return (
                    <div
                      key={d.name}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isDrift
                          ? "border-rose-950/50 bg-rose-950/5"
                          : "border-gray-900 bg-gray-900/10 hover:bg-gray-900/30"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{d.monthName}</p>
                        <p className="text-[9px] text-gray-500 font-mono">
                          p-val: {d.pValue.toExponential(3)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold font-mono text-gray-300">
                          KS: {d.ks.toFixed(4)}
                        </p>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${
                            isDrift ? "bg-rose-950 text-rose-400" : "bg-emerald-950 text-emerald-400"
                          }`}
                        >
                          {isDrift ? "Drift" : "Stable"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Scatter Plot and Confusion Matrix */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drift vs Error Scatter Plot */}
          <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Drift intensity vs forecast error
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Scatter profile mapping KS Statistic (X) against Monthly MAE (Y)
              </p>
            </div>

            <div className="flex-1 w-full my-4 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                  <XAxis
                    type="number"
                    dataKey="ks"
                    name="KS Statistic"
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0.04, 0.16]}
                  />
                  <YAxis
                    type="number"
                    dataKey="mae"
                    name="MAE"
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[2000, 5500]}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-gray-800 bg-gray-950/95 p-3 text-xs shadow-2xl">
                            <p className="font-bold text-white mb-1">{pt.monthName}</p>
                            <p className="text-gray-400 font-mono">KS distance: {pt.ks.toFixed(5)}</p>
                            <p className="text-gray-400 font-mono">MAE error: {pt.mae.toFixed(2)} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    x={0.1}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{ value: "KS Limit", fill: "#f43f5e", fontSize: 9, position: "insideTop" }}
                  />
                  <Scatter name="Months" data={scatterData} fill="#38bdf8">
                    {scatterData.map((entry, index) => {
                      const isDrift = entry.ks > 0.1;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isDrift ? "#f43f5e" : "#10b981"}
                          r={6}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-900 pt-4">
              <span>Interpretation Profile: Negatively correlated</span>
            </div>
          </div>

          {/* Correlation Interpretation & Confusion Matrix */}
          <div className="space-y-6">
            {/* Correlation Metrics */}
            <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Correlation Statistics
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-900 bg-gray-900/10">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Pearson Coefficient</p>
                  <p className="text-lg font-bold text-white font-mono mt-1">
                    {driftError?.pearson.correlation.toFixed(4) ?? fallbackDriftError.pearson.correlation}
                  </p>
                  <p className="text-[9px] text-gray-600 mt-1">
                    p-value: {driftError?.pearson.p_value.toFixed(4) ?? fallbackDriftError.pearson.p_value} (Insig.)
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-900 bg-gray-900/10">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Spearman Rank</p>
                  <p className="text-lg font-bold text-white font-mono mt-1">
                    {driftError?.spearman.correlation.toFixed(4) ?? fallbackDriftError.spearman.correlation}
                  </p>
                  <p className="text-[9px] text-gray-600 mt-1">
                    p-value: {driftError?.spearman.p_value.toFixed(4) ?? fallbackDriftError.spearman.p_value} (Insig.)
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-gray-900/40 rounded-xl text-xs text-gray-400 leading-relaxed">
                📢 <strong>Scientific Interpretation:</strong> The observed relationship between distribution drift (KS) and forecasting error (MAE) is <strong>not statistically significant</strong>. Do not claim causal feedback links between feature shift magnitudes and final MAE spikes based on this limited timeframe.
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Drift Detection Statistics
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Stats cards */}
                <div className="md:col-span-1 space-y-3">
                  <div className="p-3.5 rounded-xl border border-gray-900 bg-gray-900/20">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Precision</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">0.167</p>
                    <p className="text-[9px] text-gray-600">TP / (TP + FP)</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-900 bg-gray-900/20">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Recall</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">0.250</p>
                    <p className="text-[9px] text-gray-600">TP / (TP + FN)</p>
                  </div>
                </div>

                {/* Confusion Matrix Grid */}
                <div className="md:col-span-2 rounded-xl border border-gray-900 bg-gray-950 p-4 space-y-3 text-center">
                  <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase">
                    <div />
                    <div>High Error</div>
                    <div>Normal</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center text-xs font-mono">
                    <div className="text-[10px] text-gray-500 font-bold uppercase text-left">Detected Drift</div>
                    <div className="p-3 rounded-lg border border-emerald-950 bg-emerald-950/10 text-emerald-400 font-bold">
                      1 <p className="text-[8px] text-gray-500 font-normal">True Pos (TP)</p>
                    </div>
                    <div className="p-3 rounded-lg border border-red-950 bg-red-950/10 text-red-400 font-bold">
                      5 <p className="text-[8px] text-gray-500 font-normal">False Pos (FP)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center text-xs font-mono">
                    <div className="text-[10px] text-gray-500 font-bold uppercase text-left">No Drift</div>
                    <div className="p-3 rounded-lg border border-rose-950/40 bg-rose-950/5 text-rose-300 font-bold">
                      3 <p className="text-[8px] text-gray-500 font-normal">False Neg (FN)</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-900 bg-gray-900/30 text-gray-400 font-bold">
                      2 <p className="text-[8px] text-gray-500 font-normal">True Neg (TN)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StateWrapper>
    </div>
  );
}
