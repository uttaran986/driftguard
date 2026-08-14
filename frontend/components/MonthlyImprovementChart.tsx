"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

const monthlyImprovementData = [
  { month: 1, name: "Jan", improvement: 0.000000 },
  { month: 2, name: "Feb", improvement: 4.219837 },
  { month: 3, name: "Mar", improvement: 8.122146 },
  { month: 4, name: "Apr", improvement: -2.901826 },
  { month: 5, name: "May", improvement: 4.317903 },
  { month: 6, name: "Jun", improvement: 5.252008 },
  { month: 7, name: "Jul", improvement: 0.410652 },
  { month: 8, name: "Aug", improvement: -1.194648 },
  { month: 9, name: "Sep", improvement: 0.495226 },
  { month: 10, name: "Oct", improvement: 0.107020 },
  { month: 11, name: "Nov", improvement: -1.467425 },
  { month: 12, name: "Dec", improvement: 6.717769 },
];

export default function MonthlyImprovementChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.improvement >= 0;

      return (
        <div className="rounded-xl border border-gray-800 bg-gray-950/90 backdrop-blur-md p-4 text-xs shadow-2xl">
          <p className="font-bold text-white mb-1">{data.name} (Month {data.month})</p>
          <p
            className={`font-mono font-bold ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? "Improvement" : "Degradation"}:{" "}
            {isPositive ? "+" : ""}
            {data.improvement.toFixed(4)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col shadow-2xl h-[450px]">
      <div>
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Monthly Improvement Trend
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Relative forecasting MAE adjustment showing positive & negative drift cycles
        </p>
      </div>

      <div className="flex-1 w-full my-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyImprovementData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#4b5563" strokeWidth={1.5} />
            <Bar dataKey="improvement" radius={[4, 4, 0, 0]}>
              {monthlyImprovementData.map((entry, index) => {
                const isPositive = entry.improvement >= 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isPositive ? "#10b981" : "#f43f5e"}
                    fillOpacity={0.8}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary insights */}
      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-900 pt-4">
        <span>DriftGuard V3 vs Static Model</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-emerald-500" />
            <span>Improvement</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-rose-500" />
            <span>Degradation</span>
          </span>
        </span>
      </div>
    </div>
  );
}
