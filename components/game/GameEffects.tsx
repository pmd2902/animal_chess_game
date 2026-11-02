"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { boardToWorldPosition } from "@/game/animations";
import { useGameStore } from "@/stores/gameStore";

interface ImpactBurst {
  id: string;
  position: [number, number, number];
  startTime: number;
  color: string;
}

function BurstRing({ burst }: { burst: ImpactBurst }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const elapsed = (performance.now() - burst.startTime) / 650;
    const t = Math.min(1, Math.max(0, elapsed));

    if (ringRef.current) {
      const s = 0.3 + t * 2.2;
      ringRef.current.scale.set(s, s, 1);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, (1 - t) * 0.9);
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const dist = 0.2 + t * 1.1;
        child.position.set(
          Math.cos(angle) * dist,
          Math.sin(t * Math.PI) * 0.7,
          Math.sin(angle) * dist
        );
        child.scale.setScalar(Math.max(0.01, 1 - t));
      });
    }
  });

  return (
    <group position={burst.position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[0.3, 0.45, 24]} />
        <meshBasicMaterial
          color={burst.color}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={particlesRef}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <mesh key={idx}>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color="#FFD166"
              emissive={burst.color}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function GameEffects() {
  const activeAnimation = useGameStore((s) => s.activeAnimation);
  const status = useGameStore((s) => s.status);
  const [bursts, setBursts] = useState<ImpactBurst[]>([]);

  useEffect(() => {
    if (!activeAnimation) return;

    const isCapture =
      activeAnimation.moveType === "capture" ||
      activeAnimation.moveType === "jump_capture";

    // Trigger landing or capture impact burst halfway/near end of animation
    const delay = isCapture ? activeAnimation.duration * 0.55 : activeAnimation.duration * 0.85;
    const timer = setTimeout(() => {
      const worldPos = boardToWorldPosition(activeAnimation.to, 0.22);
      const newBurst: ImpactBurst = {
        id: `burst-${Date.now()}`,
        position: worldPos,
        startTime: performance.now(),
        color: isCapture ? "#FF4D6D" : "#FFD166",
      };
      setBursts((prev) => [...prev.slice(-4), newBurst]);
    }, delay);

    return () => clearTimeout(timer);
  }, [activeAnimation]);

  return (
    <group>
      {/* AMBIENT FLOATING FIREFLIES & GOLDEN POLLEN AROUND THE BOARD */}
      <Sparkles
        count={status === "victory" ? 90 : 38}
        scale={[14, 5, 16]}
        position={[0, 2.2, 0]}
        size={status === "victory" ? 4.5 : 2.6}
        speed={0.4}
        opacity={0.75}
        color="#FFE66D"
      />

      {/* IMPACT & LANDING BURSTS */}
      {bursts.map((b) => (
        <BurstRing key={b.id} burst={b} />
      ))}
    </group>
  );
}

