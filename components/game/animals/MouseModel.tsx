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
 * Chuột Đồng Lúa (Bậc 1) — Oversized Round Ears, Pink Tail & Traditional Headband
 */
export function MouseModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.mouse;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 4.5,
      earAmplitude: 0.09,
    });

  return (
    <group scale={meta.scale * scale}>
      {/* BODY */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <ChubbyTorso
          primaryColor={meta.primaryColor}
          secondaryColor={meta.secondaryColor}
        />
      </group>

      {/* HEAD + OVERSIZED ROUND EARS + HEADBAND */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />
        <CuteFace headZ={0.2} headY={-0.02} noseColor="#FF758F" isMouse />

        <group ref={leftEarRef} position={[-0.22, 0.2, 0.02]}>
          <mesh scale={[1, 1, 0.35]} castShadow>
            <sphereGeometry args={[0.135, 16, 16]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
          <mesh position={[0, 0, 0.025]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.095, 14, 14]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
        </group>

        <group ref={rightEarRef} position={[0.22, 0.2, 0.02]}>
          <mesh scale={[1, 1, 0.35]} castShadow>
            <sphereGeometry args={[0.135, 16, 16]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
          <mesh position={[0, 0, 0.025]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.095, 14, 14]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
        </group>

        {/* Traditional Vietnamese Headband */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.025, 8, 20]} />
          <meshStandardMaterial color={teamRibbonColor} />
        </mesh>
      </group>

      {/* PINK MOUSE TAIL */}
      <WaggingTail tailRef={tailRef} color="#FFB5A7" />
    </group>
  );
}

