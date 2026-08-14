"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Exact MAE results from research
const monthlyMAEData = [
  { month: 1, name: "Jan", staticMAE: 3356.956172, adaptiveMAE: 3356.956172 },
  { month: 2, name: "Feb", staticMAE: 2350.612054, adaptiveMAE: 2251.420049 },
  { month: 3, name: "Mar", staticMAE: 3054.394768, adaptiveMAE: 2806.312367 },
  { month: 4, name: "Apr", staticMAE: 3675.887102, adaptiveMAE: 3782.554950 },
  { month: 5, name: "May", staticMAE: 4246.518953, adaptiveMAE: 4063.158384 },
  { month: 6, name: "Jun", staticMAE: 4521.036432, adaptiveMAE: 4283.591242 },
  { month: 7, name: "Jul", staticMAE: 4303.428032, adaptiveMAE: 4285.755912 },
  { month: 8, name: "Aug", staticMAE: 5000.357740, adaptiveMAE: 5060.094419 },
  { month: 9, name: "Sep", staticMAE: 4360.572585, adaptiveMAE: 4338.977900 },
  { month: 10, name: "Oct", staticMAE: 4934.813483, adaptiveMAE: 4929.532223 },
  { month: 11, name: "Nov", staticMAE: 3387.501259, adaptiveMAE: 3437.210310 },
  { month: 12, name: "Dec", staticMAE: 3450.209479, adaptiveMAE: 3218.432383 },
];

export default function MonthlyMAEChart() {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const diff = data.staticMAE - data.adaptiveMAE;
      const improvement = (diff / data.staticMAE) * 100;

      return (
        <div className="rounded-xl border border-gray-800 bg-gray-950/90 backdrop-blur-md p-4 text-xs shadow-2xl">
          <p className="font-bold text-white mb-2">{data.name} (Month {data.month})</p>
          <div className="space-y-1 text-gray-400">
            <p className="flex justify-between gap-6">
              <span>Static MAE:</span>
              <span className="font-mono font-semibold text-sky-400">
                {data.staticMAE.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between gap-6">
              <span>Adaptive V3 MAE:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {data.adaptiveMAE.toFixed(2)}
              </span>
            </p>
            <div className="border-t border-gray-900 my-2 pt-2 flex justify-between gap-6">
              <span>Performance Impact:</span>
              {improvement > 0 ? (
                <span className="font-mono font-bold text-emerald-400">
                  +{improvement.toFixed(2)}% (Improved)
                </span>
              ) : improvement < 0 ? (
                <span className="font-mono font-bold text-rose-400">
                  {improvement.toFixed(2)}% (Worse)
                </span>
              ) : (
                <span className="font-mono text-gray-500">No Change</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col shadow-2xl h-[450px]">
      <div>
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Static MAE vs Adaptive V3 MAE
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          2D line/area representation showing prediction error trajectories
        </p>
      </div>

      <div className="flex-1 w-full my-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={monthlyMAEData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="staticGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="adaptiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
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
              domain={["dataMin - 500", "dataMax + 200"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
            />
            <Area
              name="Static Model MAE"
              type="monotone"
              dataKey="staticMAE"
              stroke="#0ea5e9"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#staticGrad)"
            />
            <Area
              name="Adaptive V3 MAE"
              type="monotone"
              dataKey="adaptiveMAE"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#adaptiveGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-900 pt-4 text-center">
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase">
            Avg Improvement
          </p>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            2.007%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase">
            Median Improvement
          </p>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            0.453%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase">
            Improved Months
          </p>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            8 / 12
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase">
            Worse Months
          </p>
          <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">
            3 / 12
          </p>
        </div>
      </div>
    </div>
  );
}
