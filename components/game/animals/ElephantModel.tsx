"use client";

import React from "react";
import { RoundedBox } from "@react-three/drei";
import { ANIMAL_METADATA } from "@/game/rules";
import { AnimalModelProps } from "./types";
import {
  ChubbyTorso,
  ForeheadTeamGem,
  useAnimalIdleMotion,
  WaggingTail,
} from "./AnimalBaseParts";

/**
 * Voi Bản Đôn (Bậc 8) — Tây Nguyên Thổ Cẩm Brocade Saddle, Floppy Ears, Ivory Tusks & Trunk
 */
export function ElephantModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.elephant;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";
  const goldColor = "#FFD166";

  const {
    bodyGroupRef,
    headGroupRef,
    tailRef,
    leftEarRef,
    rightEarRef,
    accessoryRef,
  } = useAnimalIdleMotion({
    animPhaseOffset,
    wagSpeed: 4.0,
    earAmplitude: 0.16,
  });

  return (
    <group scale={meta.scale * scale}>
      {/* BODY + TÂY NGUYÊN THỔ CẨM SADDLE CLOTH */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <ChubbyTorso
          primaryColor={meta.primaryColor}
          secondaryColor={meta.secondaryColor}
        >
          <group position={[0, 0.08, -0.02]}>
            <RoundedBox
              args={[0.52, 0.22, 0.36]}
              radius={0.05}
              smoothness={4}
              castShadow
            >
              <meshStandardMaterial color={teamRibbonColor} roughness={0.4} />
            </RoundedBox>
            <RoundedBox
              args={[0.54, 0.06, 0.38]}
              position={[0, -0.08, 0]}
              radius={0.02}
            >
              <meshStandardMaterial
                color={goldColor}
                metalness={0.35}
                roughness={0.3}
              />
            </RoundedBox>
          </group>
        </ChubbyTorso>
      </group>

      {/* HEAD + FLAPPING EARS + IVORY TUSKS + ANIMATED TRUNK + ROYAL CROWN */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />

        {/* Eyes */}
        <mesh position={[-0.11, 0.04, 0.21]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#1D1E2C" />
        </mesh>
        <mesh position={[0.11, 0.04, 0.21]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#1D1E2C" />
        </mesh>

        {/* Big Floppy Ears */}
        <group ref={leftEarRef} position={[-0.24, 0.02, 0.0]}>
          <mesh position={[-0.08, 0, 0]} scale={[0.35, 1.1, 0.85]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={meta.primaryColor} roughness={0.45} />
          </mesh>
        </group>
        <group ref={rightEarRef} position={[0.24, 0.02, 0.0]}>
          <mesh position={[0.08, 0, 0]} scale={[0.35, 1.1, 0.85]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={meta.primaryColor} roughness={0.45} />
          </mesh>
        </group>

        {/* Ivory Tusks */}
        <mesh
          position={[-0.1, -0.08, 0.25]}
          rotation={[0.9, -0.2, 0]}
          castShadow
        >
          <coneGeometry args={[0.038, 0.18, 10]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
        </mesh>
        <mesh
          position={[0.1, -0.08, 0.25]}
          rotation={[0.9, 0.2, 0]}
          castShadow
        >
          <coneGeometry args={[0.038, 0.18, 10]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
        </mesh>

        {/* Animated Trunk */}
        <group ref={accessoryRef} position={[0, -0.03, 0.23]}>
          <mesh position={[0, -0.08, 0.06]} rotation={[0.45, 0, 0]} castShadow>
            <capsuleGeometry args={[0.052, 0.16, 8, 12]} />
            <meshStandardMaterial color={meta.primaryColor} roughness={0.45} />
          </mesh>
        </group>

        {/* Royal Golden Crown Headpiece */}
        <mesh position={[0, 0.23, 0.04]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.09, 12]} />
          <meshStandardMaterial
            color={goldColor}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* TAIL */}
      <WaggingTail tailRef={tailRef} color={meta.primaryColor} />
    </group>
  );
}

