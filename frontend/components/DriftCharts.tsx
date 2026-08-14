"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Jan", static: 3356.96, v3: 3356.96 },
  { month: "Feb", static: 2350.61, v3: 2251.42 },
  { month: "Mar", static: 3054.39, v3: 2806.31 },
  { month: "Apr", static: 3675.89, v3: 3782.55 },
  { month: "May", static: 4246.52, v3: 4063.16 },
  { month: "Jun", static: 4521.04, v3: 4283.59 },
  { month: "Jul", static: 4303.43, v3: 4285.76 },
  { month: "Aug", static: 5000.36, v3: 5060.09 },
  { month: "Sep", static: 4360.57, v3: 4338.98 },
  { month: "Oct", static: 4934.81, v3: 4929.53 },
  { month: "Nov", static: 3387.50, v3: 3437.21 },
  { month: "Dec", static: 3450.21, v3: 3218.43 },
];

const modelData = [
  { model: "Static", rmse: 5828.83 },
  { model: "Periodic", rmse: 5830.14 },
  { model: "One-Time", rmse: 5815.27 },
  { model: "Adaptive V3", rmse: 5557.04 },
];

export default function DriftCharts() {
  return (
    <div className="mt-10 space-y-10">

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-6 text-2xl font-semibold">
          Monthly MAE: Static vs Adaptive V3
        </h2>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="static"
                name="Static Model"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="v3"
                name="Adaptive V3"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-6 text-2xl font-semibold">
          RMSE Comparison
        </h2>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="model" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="rmse"
                name="RMSE"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}