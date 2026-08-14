"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Individual components that run inside the Canvas context

function CoreSphere({ reducedMotion }: { reducedMotion: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.15;
      coreRef.current.rotation.x = time * 0.1;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -time * 0.08;
      outerRef.current.rotation.z = time * 0.05;
      // Pulse scale
      const scale = 1.0 + Math.sin(time * 2) * 0.03;
      outerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Innermost high-intensity core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshBasicMaterial
          color="#0ea5e9"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Mid outer protective shell */}
      <mesh ref={outerRef} scale={[1.05, 1.05, 1.05]}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Center solid core */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

function OrbitalRings({ reducedMotion }: { reducedMotion: boolean }) {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const time = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.y = time * 0.1;
    if (ring2Ref.current) ring2Ref.current.rotation.x = time * 0.08;
    if (ring3Ref.current) ring3Ref.current.rotation.z = time * 0.12;
  });

  return (
    <group>
      {/* Ring 1 - Equator */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.03, 64]} />
          <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Ring 2 - Vertical */}
      <group ref={ring2Ref}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[2.3, 2.33, 64]} />
          <meshBasicMaterial color="#4f46e5" side={THREE.DoubleSide} transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Ring 3 - Diagonal */}
      <group ref={ring3Ref}>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <ringGeometry args={[2.6, 2.63, 64]} />
          <meshBasicMaterial color="#f43f5e" side={THREE.DoubleSide} transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function DataParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const count = reducedMotion ? 40 : 150;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, colors] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorSky = new THREE.Color("#38bdf8");
    const colorIndigo = new THREE.Color("#818cf8");

    for (let i = 0; i < count; i++) {
      // Spawn particles randomly on spherical shell
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.5; // Radius offset

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixedColor = colorSky.clone().lerp(colorIndigo, Math.random());
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols];
  }, [count]);

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.rotation.x = time * 0.02;

    // Subtle breathing scale
    meshRef.current.scale.setScalar(1.0 + Math.sin(time * 0.5) * 0.05);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={reducedMotion ? 0.08 : 0.05}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Subtle camera controller that listens to cursor movements
function ParallaxCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  useFrame((state) => {
    if (reducedMotion) return;
    // Smoothly interpolate camera position based on mouse coordinates
    const targetX = mouse.x * 0.8;
    const targetY = mouse.y * 0.8;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY + 0.5, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function EnergyCore() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center rounded-2xl border border-gray-900 bg-gray-950/40 overflow-hidden shadow-2xl">
      {/* Floating Labels */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest font-mono">
            Active Core Visualization
          </p>
        </div>
        <h3 className="text-lg font-bold text-white mt-1 uppercase font-sans tracking-wide">
          DRIFTGUARD AI ENGINE
        </h3>
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          Adaptive Forecast Monitoring
        </p>
      </div>

      {/* Help info */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none text-right">
        <p className="text-[10px] text-gray-600 font-mono">
          Drag to rotate core • Scroll to zoom
        </p>
      </div>

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0.5, 6.5], fov: 45 }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />

        <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.3} floatIntensity={0.2}>
          <group scale={hovered ? 1.05 : 1.0}>
            <CoreSphere reducedMotion={reducedMotion} />
            <OrbitalRings reducedMotion={reducedMotion} />
            <DataParticles reducedMotion={reducedMotion} />
          </group>
        </Float>

        <ParallaxCamera reducedMotion={reducedMotion} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={12}
          minDistance={3.5}
        />
      </Canvas>

      {/* Subtly glowing floor grid */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none opacity-80" />
    </div>
  );
}
