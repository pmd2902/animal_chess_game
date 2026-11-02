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
 * Hổ Đông Dương (Bậc 6) — Black Stripes & Southern Khăn Rằn Neck Scarf
 */
export function TigerModel({
  isRed = true,
  animPhaseOffset = 0,
  scale = 1,
}: AnimalModelProps) {
  const meta = ANIMAL_METADATA.tiger;
  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";

  const { bodyGroupRef, headGroupRef, tailRef, leftEarRef, rightEarRef } =
    useAnimalIdleMotion({
      animPhaseOffset,
      wagSpeed: 3.2,
      earAmplitude: 0.08,
    });

  return (
    <group scale={meta.scale * scale}>
      {/* BODY + BLACK STRIPES + KHĂN RẰN NECK SCARF */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <ChubbyTorso
          primaryColor={meta.primaryColor}
          secondaryColor={meta.secondaryColor}
        >
          {[-0.08, 0.02, 0.11].map((zOffset, i) => (
            <mesh
              key={i}
              position={[0, 0.05, zOffset]}
              scale={[1.08, 0.85, 0.12]}
            >
              <sphereGeometry args={[0.24, 12, 12]} />
              <meshStandardMaterial color="#2B2D42" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.18, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.21, 0.042, 10, 20]} />
            <meshStandardMaterial color={teamRibbonColor} roughness={0.4} />
          </mesh>
        </ChubbyTorso>
      </group>

      {/* HEAD + TIGER EARS */}
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

