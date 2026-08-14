"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface MonthlyData {
  month: number;
  monthName: string;
  improvement: number;
}

interface MonthlyImprovement3DProps {
  data: MonthlyData[];
}

function MonthlyColumn({
  position,
  improvement,
  monthName,
  isSelected,
  onHover,
  reducedMotion,
}: {
  position: [number, number, number];
  improvement: number;
  monthName: string;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Animate column heights
  const currentHeightRef = useRef(0.01);
  const isPositive = improvement >= 0;

  // Let 8.12% map to height of 3.0 units.
  // Make height at least 0.05 so there's always something visible for 0%.
  const absImp = Math.abs(improvement);
  const targetHeight = Math.max(0.05, (absImp / 8.12) * 3.0);
  const barColor = isPositive ? "#10b981" : "#f43f5e"; // Emerald vs Rose

  useFrame(() => {
    if (!meshRef.current) return;

    if (reducedMotion) {
      currentHeightRef.current = targetHeight;
    } else {
      currentHeightRef.current = THREE.MathUtils.lerp(
        currentHeightRef.current,
        targetHeight,
        0.1
      );
    }

    meshRef.current.scale.y = currentHeightRef.current;

    // Positive values stand on the grid (extends UP)
    // Negative values hang from the grid (extends DOWN)
    meshRef.current.position.y = isPositive
      ? currentHeightRef.current / 2
      : -currentHeightRef.current / 2;
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
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial
          color={hovered || isSelected ? barColor : "#1e293b"}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={hovered || isSelected ? 0.95 : 0.6}
          emissive={hovered || isSelected ? barColor : "#000000"}
          emissiveIntensity={hovered ? 0.3 : isSelected ? 0.15 : 0}
        />
      </mesh>
    </group>
  );
}

export default function MonthlyImprovement3D({ data }: MonthlyImprovement3DProps) {
  const [hoveredColumn, setHoveredColumn] = useState<any | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[450px] rounded-2xl border border-gray-900 bg-gray-950/40 p-6 flex flex-col justify-between shadow-2xl">
      {/* Upper Title */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            3D Monthly DriftGuard Impact
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Visualization of monthly Adaptive V3 MAE improvement relative to Static Model
          </p>
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div className="relative flex-1 w-full my-4">
        {/* Tooltip Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none min-w-[220px]">
          {hoveredColumn ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950/90 backdrop-blur-md p-4 text-left shadow-2xl animate-fade-in">
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                {hoveredColumn.monthName} (Month {hoveredColumn.month})
              </p>
              <h4
                className={`text-sm font-bold mt-0.5 ${
                  hoveredColumn.improvement >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {hoveredColumn.improvement >= 0 ? "Improvement" : "Degradation"}:{" "}
                {Math.abs(hoveredColumn.improvement).toFixed(4)}%
              </h4>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                {hoveredColumn.improvement >= 0
                  ? "Adaptive retraining successful in correcting prediction skew."
                  : "Variance in model retraining parameters caused higher relative errors."}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800/40 bg-gray-950/30 backdrop-blur-sm p-4 text-left">
              <p className="text-xs text-gray-500 font-medium">
                Hover over a month column to inspect the improvement %.
              </p>
            </div>
          )}
        </div>

        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 2, 7.5], fov: 42 }}>
          <ambientLight intensity={0.25} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#818cf8" />
          <directionalLight position={[0, 10, 0]} intensity={0.8} />

          {/* Group container shifted down slightly to center positive/negative heights */}
          <group position={[0, 0, 0]}>
            {data.map((item, idx) => {
              // Distribute 12 months evenly along X axis from -3.3 to +3.3
              const xPos = idx * 0.6 - 3.3;

              return (
                <MonthlyColumn
                  key={item.month}
                  position={[xPos, 0, 0]}
                  improvement={item.improvement}
                  monthName={item.monthName}
                  isSelected={hoveredColumn?.month === item.month}
                  reducedMotion={reducedMotion}
                  onHover={(isHovered) => {
                    if (isHovered) {
                      setHoveredColumn({
                        month: item.month,
                        monthName: item.monthName,
                        improvement: item.improvement,
                      });
                    } else {
                      setHoveredColumn((prev: any) =>
                        prev?.month === item.month ? null : prev
                      );
                    }
                  }}
                />
              );
            })}

            {/* Zero Reference Line */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[7.2, 0.05]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
            </mesh>

            {/* Subtle Grid Floor */}
            <gridHelper args={[8, 16, "#1e293b", "#0f172a"]} position={[0, -1.8, 0]} />
          </group>

          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>

      {/* Footer Info / Colors Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 z-10 border-t border-gray-900 pt-4">
        {/* Colors Legend */}
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-gray-400">Positive Improvement (&ge; 0%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-gray-400">Performance Degradation (&lt; 0%)</span>
          </div>
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
