"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface IdleMotionOptions {
  animPhaseOffset?: number;
  wagSpeed?: number;
  earAmplitude?: number;
  hasAccessoryMotion?: boolean;
}

/**
 * Shared procedural idle animation hook (breathing, head bobbing, tail wagging, ear twitching)
 * that any standalone animal component can attach to its group refs.
 */
export function useAnimalIdleMotion({
  animPhaseOffset = 0,
  wagSpeed = 4.0,
  earAmplitude = 0.08,
}: IdleMotionOptions = {}) {
  const bodyGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const accessoryRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + animPhaseOffset;

    if (bodyGroupRef.current) {
      const breathe = 1 + Math.sin(t * 2.6) * 0.028;
      bodyGroupRef.current.scale.set(breathe, 1 / Math.sqrt(breathe), breathe);
    }

    if (headGroupRef.current) {
      headGroupRef.current.rotation.z = Math.sin(t * 1.7) * 0.045;
      headGroupRef.current.rotation.x = Math.sin(t * 2.3) * 0.035;
      headGroupRef.current.position.y = 0.56 + Math.sin(t * 2.6) * 0.015;
    }

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * wagSpeed) * 0.28;
      tailRef.current.rotation.x = -0.35 + Math.cos(t * 2.2) * 0.08;
    }

    if (leftEarRef.current && rightEarRef.current) {
      const earWave = Math.sin(t * 3.1) * earAmplitude;
      leftEarRef.current.rotation.y = earWave;
      rightEarRef.current.rotation.y = -earWave;
    }

    if (accessoryRef.current) {
      accessoryRef.current.rotation.x = Math.sin(t * 2.8) * 0.18;
    }
  });

  return {
    bodyGroupRef,
    headGroupRef,
    tailRef,
    leftEarRef,
    rightEarRef,
    accessoryRef,
  };
}

export function CuteFace({
  headZ = 0.2,
  headY = -0.02,
  noseColor = "#2B2D42",
  isMouse = false,
}: {
  headZ?: number;
  headY?: number;
  noseColor?: string;
  isMouse?: boolean;
}) {
  return (
    <group position={[0, headY, headZ]}>
      {/* Left Eye */}
      <mesh position={[-0.095, 0.04, 0.02]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color="#1D1E2C" roughness={0.2} />
      </mesh>
      <mesh position={[-0.082, 0.052, 0.05]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.095, 0.04, 0.02]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color="#1D1E2C" roughness={0.2} />
      </mesh>
      <mesh position={[0.108, 0.052, 0.05]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Rosy Cheeks */}
      <mesh position={[-0.14, -0.01, 0.0]} scale={[1.2, 0.8, 0.5]}>
        <sphereGeometry args={[0.032, 10, 10]} />
        <meshStandardMaterial color="#FF758F" roughness={0.6} />
      </mesh>
      <mesh position={[0.14, -0.01, 0.0]} scale={[1.2, 0.8, 0.5]}>
        <sphereGeometry args={[0.032, 10, 10]} />
        <meshStandardMaterial color="#FF758F" roughness={0.6} />
      </mesh>

      {/* Snout / Muzzle */}
      <mesh position={[0, -0.02, 0.03]} scale={[1.25, 0.9, 0.85]} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshStandardMaterial color="#FFF8F0" roughness={0.5} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.0, 0.095]} scale={[1.2, 0.9, 0.9]}>
        <sphereGeometry args={[isMouse ? 0.034 : 0.028, 10, 10]} />
        <meshStandardMaterial color={noseColor} roughness={0.35} />
      </mesh>
    </group>
  );
}

const PAW_OFFSETS: Array<[number, number, number]> = [
  [-0.14, -0.19, 0.14],
  [0.14, -0.19, 0.14],
  [-0.14, -0.19, -0.14],
  [0.14, -0.19, -0.14],
];

export function ChubbyTorso({
  primaryColor,
  secondaryColor,
  children,
}: {
  primaryColor: string;
  secondaryColor: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <mesh castShadow receiveShadow scale={[1.05, 0.95, 1.15]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color={primaryColor} roughness={0.45} />
      </mesh>

      {/* Soft Belly Patch */}
      <mesh position={[0, -0.02, 0.18]} scale={[0.72, 0.78, 0.5]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.55} />
      </mesh>

      {/* 4 Cute Stubby Paws */}
      {PAW_OFFSETS.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow>
          <sphereGeometry args={[0.085, 12, 12]} />
          <meshStandardMaterial color={primaryColor} roughness={0.5} />
        </mesh>
      ))}

      {children}
    </>
  );
}

export function ForeheadTeamGem({ teamColor }: { teamColor: string }) {
  return (
    <mesh position={[0, 0.14, 0.21]} rotation={[0.3, 0, Math.PI / 4]}>
      <boxGeometry args={[0.065, 0.065, 0.03]} />
      <meshStandardMaterial
        color={teamColor}
        emissive={teamColor}
        emissiveIntensity={0.35}
        roughness={0.2}
      />
    </mesh>
  );
}

export function WaggingTail({
  tailRef,
  color,
}: {
  tailRef: React.RefObject<THREE.Group | null>;
  color: string;
}) {
  return (
    <group ref={tailRef} position={[0, 0.24, -0.24]}>
      <mesh position={[0, 0.08, -0.08]} rotation={[-0.6, 0, 0]} castShadow>
        <capsuleGeometry args={[0.036, 0.22, 8, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

