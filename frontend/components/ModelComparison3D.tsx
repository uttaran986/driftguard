"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelData {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  smape: number;
  retraining_events: number;
  mae_improvement: number;
  rmse_improvement: number;
}

interface ModelComparison3DProps {
  data: ModelData[];
}

type MetricType = "mae" | "rmse" | "retraining_events";

// 3D Bar component
function Bar({
  position,
  height,
  color,
  label,
  value,
  isSelected,
  onHover,
  reducedMotion,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  value: string;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Smooth height animation on value change
  const currentHeightRef = useRef(0.01);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetHeight = Math.max(0.1, height);

    if (reducedMotion) {
      currentHeightRef.current = targetHeight;
    } else {
      // Lerp height
      currentHeightRef.current = THREE.MathUtils.lerp(
        currentHeightRef.current,
        targetHeight,
        0.1
      );
    }

    meshRef.current.scale.y = currentHeightRef.current;
    // Offset position Y so it stands on the floor
    meshRef.current.position.y = currentHeightRef.current / 2;
  });

  useEffect(() => {
    onHover(hovered);
  }, [hovered, onHover]);

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={hovered || isSelected ? color : "#1e293b"}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={hovered || isSelected ? 0.95 : 0.65}
          emissive={hovered || isSelected ? color : "#000000"}
          emissiveIntensity={hovered ? 0.25 : isSelected ? 0.15 : 0}
        />
      </mesh>
    </group>
  );
}

export default function ModelComparison3D({ data }: ModelComparison3DProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("mae");
  const [hoveredBar, setHoveredBar] = useState<any | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Normalization details for Heights:
  // We want the tallest bar to be 3.5 units high.
  const getNormHeight = (model: ModelData) => {
    const values = data.map((d) => d[selectedMetric]);
    const maxVal = Math.max(...values, 0.001);
    const minVal = Math.min(...values);

    if (selectedMetric === "retraining_events") {
      // Linear mapping from 0 to 7 events -> height 0.2 to 3.5
      return (model.retraining_events / 7) * 3.3 + 0.2;
    }

    // For error metrics (MAE/RMSE), higher values should look taller,
    // or smaller error should look better?
    // The prompt says height should map to metric value.
    return (model[selectedMetric] / maxVal) * 3.3 + 0.2;
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "mae":
        return "MAE";
      case "rmse":
        return "RMSE";
      case "retraining_events":
        return "Retraining Events";
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const barColors = {
    "Static Model": "#3b82f6", // Blue
    "Periodic Retraining": "#eab308", // Yellow
    "One-Time DriftGuard": "#ec4899", // Pink
    "Adaptive DriftGuard V3": "#10b981", // Emerald
  };

  const formattedValue = (val: number, key: MetricType) => {
    if (key === "retraining_events") return val.toString();
    return val.toFixed(4);
  };

  return (
    <div className="relative w-full h-[450px] rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col justify-between shadow-2xl">
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            3D Research Benchmark
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare forecast error metrics & training overhead in 3D
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-gray-900/60 border border-gray-800 self-start md:self-auto">
          {(["mae", "rmse", "retraining_events"] as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                selectedMetric === metric
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {metric === "retraining_events" ? "Retraining" : metric}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div className="relative flex-1 w-full my-4">
        {/* Dynamic Tooltip Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none min-w-[200px]">
          {hoveredBar ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950/90 backdrop-blur-md p-4 text-left shadow-2xl animate-fade-in">
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                {hoveredBar.model}
              </p>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {getMetricLabel()}: {hoveredBar.formattedValue}
              </h4>
              {hoveredBar.improvement > 0 ? (
                <p className="text-xs text-emerald-400 font-medium mt-1">
                  Improvement: +{hoveredBar.improvement.toFixed(4)}%
                </p>
              ) : hoveredBar.improvement < 0 ? (
                <p className="text-xs text-rose-400 font-medium mt-1">
                  Degradation: {hoveredBar.improvement.toFixed(4)}%
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Baseline Model
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800/40 bg-gray-950/30 backdrop-blur-sm p-4 text-left">
              <p className="text-xs text-gray-500 font-medium">
                Hover over a bar column to inspect specific model details.
              </p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <Canvas camera={{ position: [0, 3, 7.5], fov: 40 }}>
          <ambientLight intensity={0.25} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#818cf8" />
          <directionalLight position={[0, 10, 0]} intensity={0.8} />

          {/* Render Bars */}
          <group position={[-0.2, -1.2, 0]}>
            {data.map((model, idx) => {
              const xPos = idx * 1.6 - 2.4; // Center layout
              const color = barColors[model.model as keyof typeof barColors] || "#64748b";
              const rawVal = model[selectedMetric];
              const h = getNormHeight(model);

              // Calculate improvement relative to Static Model (baseline index 0)
              let imp = 0;
              if (idx > 0) {
                if (selectedMetric === "mae") imp = model.mae_improvement;
                else if (selectedMetric === "rmse") imp = model.rmse_improvement;
                else if (selectedMetric === "retraining_events") {
                  // Percentage change in retraining events isn't improvement, we just show raw diff
                  imp = -(model.retraining_events - data[0].retraining_events);
                }
              }

              return (
                <Bar
                  key={model.model}
                  position={[xPos, 0, 0]}
                  height={h}
                  color={color}
                  label={model.model}
                  value={formattedValue(rawVal, selectedMetric)}
                  isSelected={hoveredBar?.model === model.model}
                  reducedMotion={reducedMotion}
                  onHover={(isHovered) => {
                    if (isHovered) {
                      setHoveredBar({
                        model: model.model,
                        rawVal,
                        formattedValue: formattedValue(rawVal, selectedMetric),
                        improvement: imp,
                      });
                    } else {
                      setHoveredBar((prev: any) =>
                        prev?.model === model.model ? null : prev
                      );
                    }
                  }}
                />
              );
            })}

            {/* Grid Floor */}
            <gridHelper args={[10, 10, "#1e293b", "#0f172a"]} position={[0, -0.01, 0]} />
          </group>

          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1} // Prevent going below grid
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>

      {/* Footer Info / Color Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 z-10 border-t border-gray-900 pt-4">
        {/* Colors Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {Object.entries(barColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-gray-950/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-400 font-medium">{name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleResetCamera}
          className="text-xs font-semibold text-gray-500 hover:text-white bg-gray-900/30 border border-gray-900 hover:border-gray-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          Reset Camera
        </button>
      </div>
    </div>
  );
}
