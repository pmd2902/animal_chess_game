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
 * Mèo Mướp Nón Lá (Bậc 2) — Pointed Ears & Miniature Vietnamese Conical Hat (Nón Lá)
 */
export function CatModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.cat;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 3.2,
      earAmplitude: 0.08,
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

      {/* HEAD + CAT EARS + VIETNAMESE NÓN LÁ */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />
        <CuteFace headZ={0.2} headY={-0.02} noseColor="#FF758F" />

        <group ref={leftEarRef} position={[-0.17, 0.19, 0]}>
          <mesh rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[0.075, 0.17, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>

        <group ref={rightEarRef} position={[0.17, 0.19, 0]}>
          <mesh rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[0.075, 0.17, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>

        {/* Miniature Vietnamese Nón Lá */}
        <group position={[0, 0.26, -0.02]} rotation={[-0.18, 0, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.28, 0.15, 24]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.015, 8, 20]} />
            <meshStandardMaterial color={teamRibbonColor} />
          </mesh>
        </group>
      </group>

      {/* TAIL */}
      <WaggingTail tailRef={tailRef} color={meta.primaryColor} />
    </group>
  );
}

