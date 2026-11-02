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

const LEOPARD_SPOT_OFFSETS: Array<[number, number, number]> = [
  [-0.18, 0.08, 0.05],
  [0.18, 0.08, 0.05],
  [-0.16, 0.04, -0.12],
  [0.16, 0.04, -0.12],
  [0, 0.16, -0.08],
];

/**
 * Báo Hoa Mai (Bậc 5) — Golden Coat with Spotted Rosettes
 */
export function LeopardModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.leopard;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 4.0,
      earAmplitude: 0.08,
    });

  return (
    <group scale={meta.scale * scale}>
      {/* BODY + LEOPARD SPOTS */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <ChubbyTorso
          primaryColor={meta.primaryColor}
          secondaryColor={meta.secondaryColor}
        >
          {LEOPARD_SPOT_OFFSETS.map((pos, idx) => (
            <mesh key={idx} position={pos}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color="#582F0E" roughness={0.5} />
            </mesh>
          ))}
        </ChubbyTorso>
      </group>

      {/* HEAD + ROUNDED EARS */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        <ForeheadTeamGem teamColor={teamRibbonColor} />
        <CuteFace headZ={0.2} headY={-0.02} noseColor="#2B2D42" />

        <group ref={leftEarRef} position={[-0.18, 0.19, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={meta.secondaryColor} />
          </mesh>
        </group>

        <group ref={rightEarRef} position={[0.18, 0.19, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={meta.primaryColor} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={meta.secondaryColor} />
          </mesh>
        </group>
      </group>

      {/* TAIL */}
      <WaggingTail tailRef={tailRef} color={meta.primaryColor} />
    </group>
  );
}

