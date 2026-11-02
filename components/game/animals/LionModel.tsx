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
 * Sư Tử Sơn Lâm (Bậc 7) — Nghê Thần / Sculpted Golden Mane Ring
 */
export function LionModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.lion;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 4.0,
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

      {/* HEAD + SCULPTED GOLDEN MANE */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />
        <CuteFace headZ={0.2} headY={-0.02} noseColor="#2B2D42" />

        {/* 10-Petal Fluffy Mane Ring */}
        {Array.from({ length: 10 }).map((_, idx) => {
          const angle = (idx / 10) * Math.PI * 2;
          return (
            <mesh
              key={idx}
              position={[
                Math.cos(angle) * 0.24,
                Math.sin(angle) * 0.22,
                -0.03,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.105, 10, 10]} />
              <meshStandardMaterial
                color={meta.secondaryColor}
                roughness={0.5}
              />
            </mesh>
          );
        })}

        {/* Round Ears */}
        <group ref={leftEarRef} position={[-0.19, 0.2, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>
        <group ref={rightEarRef} position={[0.19, 0.2, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
        </group>
      </group>

      {/* TAIL */}
      <WaggingTail tailRef={tailRef} color={meta.primaryColor} />
    </group>
  );
}

