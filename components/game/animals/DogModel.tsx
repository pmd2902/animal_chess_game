"use client";

import React from "react";
import { ANIMAL_METADATA } from "@/game/rules";
import { AnimalModelProps } from "./types";
import {
  ChubbyTorso,
  CuteFace,
  ForeheadTeamGem,
  useAnimalIdleMotion,
  WaggingTail,
} from "./AnimalBaseParts";

/**
 * Chó Phú Quốc (Bậc 3) — Dorsal Hair Ridge (Xoáy Lưng) & Golden Lục Lạc Bell Collar
 */
export function DogModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.dog;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 6.5,
      earAmplitude: 0.08,
    });

  return (
    <group scale={meta.scale * scale}>
      {/* BODY + PHÚ QUỐC DORSAL RIDGE + GOLDEN LỤC LẠC BELL COLLAR */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <ChubbyTorso
          primaryColor={meta.primaryColor}
          secondaryColor={meta.secondaryColor}
        >
          {/* Dorsal Ridge (Xoáy lưng Phú Quốc) */}
          <mesh position={[0, 0.22, -0.04]} scale={[0.22, 0.25, 0.85]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.6} />
          </mesh>
          {/* Collar */}
          <mesh position={[0, 0.18, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.035, 10, 20]} />
            <meshStandardMaterial color={teamRibbonColor} roughness={0.35} />
          </mesh>
          {/* Golden Lục Lạc Bell */}
          <mesh position={[0, 0.14, 0.26]} castShadow>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial
              color="#FFD166"
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        </ChubbyTorso>
      </group>

      {/* HEAD + POINTED EARS */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />
        <CuteFace headZ={0.2} headY={-0.02} noseColor="#2B2D42" />

        <group ref={leftEarRef} position={[-0.16, 0.22, 0]}>
          <mesh rotation={[0, 0, 0.22]} castShadow>
            <coneGeometry args={[0.075, 0.19, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>

        <group ref={rightEarRef} position={[0.16, 0.22, 0]}>
          <mesh rotation={[0, 0, -0.22]} castShadow>
            <coneGeometry args={[0.075, 0.19, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>
      </group>

      {/* ENTHUSIASTIC WAGGING TAIL */}
      <WaggingTail tailRef={tailRef} color={meta.primaryColor} />
    </group>
  );
}

