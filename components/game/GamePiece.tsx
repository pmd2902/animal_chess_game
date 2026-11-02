"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { AnimalType, GamePiece as GamePieceType } from "@/game/gameTypes";
import { ANIMAL_METADATA, isInOpponentTrap, isRiverCell } from "@/game/rules";
import { boardToWorldPosition, interpolateMoveTransform } from "@/game/animations";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * Note on external 3D assets:
 * Custom GLB models can be placed in:
 *   /public/models/elephant.glb
 *   /public/models/lion.glb
 *   /public/models/tiger.glb
 *   /public/models/leopard.glb
 *   /public/models/wolf.glb
 *   /public/models/dog.glb
 *   /public/models/cat.glb
 *   /public/models/mouse.glb
 *
 * When external GLBs are not present, `VietnameseStylizedAnimalMesh` renders
 * custom-crafted, animated low-poly 3D Vietnamese animal characters with
 * cultural accessories (Nón lá, Khăn rằn, Thổ cẩm Tây Nguyên, Lục lạc, Bông lúa).
 */

interface AnimalMeshProps {
  type: AnimalType;
  isRed: boolean;
  animPhaseOffset: number;
}

function CuteFace({
  headZ = 0.24,
  headY = 0.56,
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
      {/* Left Eye Highlight */}
      <mesh position={[-0.082, 0.052, 0.05]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.095, 0.04, 0.02]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color="#1D1E2C" roughness={0.2} />
      </mesh>
      {/* Right Eye Highlight */}
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

function VietnameseStylizedAnimalMesh({ type, isRed, animPhaseOffset }: AnimalMeshProps) {
  const meta = ANIMAL_METADATA[type];
  const bodyGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const trunkOrAccessoryRef = useRef<THREE.Group>(null);

  const teamRibbonColor = isRed ? "#E63946" : "#1D84B5";
  const goldColor = "#FFD166";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + animPhaseOffset;

    // Subtle idle breathing
    if (bodyGroupRef.current) {
      const breathe = 1 + Math.sin(t * 2.6) * 0.028;
      bodyGroupRef.current.scale.set(breathe, 1 / Math.sqrt(breathe), breathe);
    }

    // Gentle head bob & look around
    if (headGroupRef.current) {
      headGroupRef.current.rotation.z = Math.sin(t * 1.7) * 0.045;
      headGroupRef.current.rotation.x = Math.sin(t * 2.3) * 0.035;
      headGroupRef.current.position.y = 0.56 + Math.sin(t * 2.6) * 0.015;
    }

    // Tail wag
    if (tailRef.current) {
      const wagSpeed = type === "dog" ? 6.5 : type === "cat" || type === "tiger" ? 3.2 : 4.0;
      tailRef.current.rotation.z = Math.sin(t * wagSpeed) * 0.28;
      tailRef.current.rotation.x = -0.35 + Math.cos(t * 2.2) * 0.08;
    }

    // Ear twitch
    if (leftEarRef.current && rightEarRef.current) {
      const earWave = Math.sin(t * 3.1) * (type === "elephant" ? 0.16 : 0.08);
      leftEarRef.current.rotation.y = earWave;
      rightEarRef.current.rotation.y = -earWave;
    }

    // Elephant trunk or Mouse nose twitch
    if (trunkOrAccessoryRef.current) {
      trunkOrAccessoryRef.current.rotation.x = Math.sin(t * 2.8) * 0.18;
    }
  });

  return (
    <group scale={meta.scale}>
      {/* CHUNKY BODY */}
      <group ref={bodyGroupRef} position={[0, 0.27, 0]}>
        <mesh castShadow receiveShadow scale={[1.05, 0.95, 1.15]}>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.45} />
        </mesh>

        {/* Soft Belly Patch */}
        <mesh position={[0, -0.02, 0.18]} scale={[0.72, 0.78, 0.5]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={meta.secondaryColor} roughness={0.55} />
        </mesh>

        {/* Cute Stubby Feet (4 paws) */}
        {[
          [-0.14, -0.19, 0.14],
          [0.14, -0.19, 0.14],
          [-0.14, -0.19, -0.14],
          [0.14, -0.19, -0.14],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos as [number, number, number]} castShadow>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color={meta.primaryColor} roughness={0.5} />
          </mesh>
        ))}

        {/* ANIMAL-SPECIFIC BODY MARKINGS & VIETNAMESE ACCESSORIES */}
        {type === "elephant" && (
          /* Tây Nguyên Thổ Cẩm Brocade Saddle Cloth */
          <group position={[0, 0.08, -0.02]}>
            <RoundedBox args={[0.52, 0.22, 0.36]} radius={0.05} smoothness={4} castShadow>
              <meshStandardMaterial color={teamRibbonColor} roughness={0.4} />
            </RoundedBox>
            <RoundedBox args={[0.54, 0.06, 0.38]} position={[0, -0.08, 0]} radius={0.02}>
              <meshStandardMaterial color={goldColor} metalness={0.35} roughness={0.3} />
            </RoundedBox>
          </group>
        )}

        {type === "tiger" && (
          /* Tiger Black Stripes & Southern Khăn Rằn Scarf */
          <group>
            {[-0.08, 0.02, 0.11].map((zOffset, i) => (
              <mesh key={i} position={[0, 0.05, zOffset]} scale={[1.08, 0.85, 0.12]}>
                <sphereGeometry args={[0.24, 12, 12]} />
                <meshStandardMaterial color="#2B2D42" roughness={0.5} />
              </mesh>
            ))}
            {/* Khăn Rằn Neck Scarf */}
            <mesh position={[0, 0.18, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.21, 0.042, 10, 20]} />
              <meshStandardMaterial color={teamRibbonColor} roughness={0.4} />
            </mesh>
          </group>
        )}

        {type === "leopard" && (
          /* Leopard Spots */
          <group>
            {[
              [-0.18, 0.08, 0.05],
              [0.18, 0.08, 0.05],
              [-0.16, 0.04, -0.12],
              [0.16, 0.04, -0.12],
              [0, 0.16, -0.08],
            ].map((pos, idx) => (
              <mesh key={idx} position={pos as [number, number, number]}>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial color="#582F0E" roughness={0.5} />
              </mesh>
            ))}
          </group>
        )}

        {type === "dog" && (
          /* Phú Quốc Ridgeback Dorsal Ridge & Golden Lục Lạc Bell Collar */
          <group>
            <mesh position={[0, 0.22, -0.04]} scale={[0.22, 0.25, 0.85]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color="#7F4F24" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.18, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.035, 10, 20]} />
              <meshStandardMaterial color={teamRibbonColor} roughness={0.35} />
            </mesh>
            {/* Golden Bell */}
            <mesh position={[0, 0.14, 0.26]} castShadow>
              <sphereGeometry args={[0.052, 12, 12]} />
              <meshStandardMaterial color="#FFD166" metalness={0.6} roughness={0.2} />
            </mesh>
          </group>
        )}
      </group>

      {/* OVERSIZED CUTE HEAD */}
      <group ref={headGroupRef} position={[0, 0.56, 0.04]}>
        <mesh castShadow receiveShadow scale={[1.12, 1.0, 1.05]}>
          <sphereGeometry args={[0.24, 22, 22]} />
          <meshStandardMaterial color={meta.primaryColor} roughness={0.42} />
        </mesh>

        {/* Team Forehead Emblem / Gem */}
        <mesh position={[0, 0.14, 0.21]} rotation={[0.3, 0, Math.PI / 4]}>
          <boxGeometry args={[0.065, 0.065, 0.03]} />
          <meshStandardMaterial
            color={teamRibbonColor}
            emissive={teamRibbonColor}
            emissiveIntensity={0.35}
            roughness={0.2}
          />
        </mesh>

        {/* Facial Features */}
        {type !== "elephant" && (
          <CuteFace
            headZ={0.2}
            headY={-0.02}
            noseColor={type === "cat" || type === "mouse" ? "#FF758F" : "#2B2D42"}
            isMouse={type === "mouse"}
          />
        )}

        {/* ELEPHANT HEAD DETAILS: Big Flapping Ears, Tusks, Animated Trunk & Eyes */}
        {type === "elephant" && (
          <group>
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
            <mesh position={[-0.1, -0.08, 0.25]} rotation={[0.9, -0.2, 0]} castShadow>
              <coneGeometry args={[0.038, 0.18, 10]} />
              <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
            </mesh>
            <mesh position={[0.1, -0.08, 0.25]} rotation={[0.9, 0.2, 0]} castShadow>
              <coneGeometry args={[0.038, 0.18, 10]} />
              <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
            </mesh>
            {/* Animated Trunk */}
            <group ref={trunkOrAccessoryRef} position={[0, -0.03, 0.23]}>
              <mesh position={[0, -0.08, 0.06]} rotation={[0.45, 0, 0]} castShadow>
                <capsuleGeometry args={[0.052, 0.16, 8, 12]} />
                <meshStandardMaterial color={meta.primaryColor} roughness={0.45} />
              </mesh>
            </group>
            {/* Royal Golden Crown Headpiece */}
            <mesh position={[0, 0.23, 0.04]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.09, 12]} />
              <meshStandardMaterial color={goldColor} metalness={0.5} roughness={0.25} />
            </mesh>
          </group>
        )}

        {/* LION (SƯ TỬ SƠN LÂM / NGHÊ THẦN): Sculpted Golden Mane */}
        {type === "lion" && (
          <group>
            {/* Fluffy Mane Ring */}
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
                  <meshStandardMaterial color={meta.secondaryColor} roughness={0.5} />
                </mesh>
              );
            })}
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
        )}

        {/* TIGER & LEOPARD EARS */}
        {(type === "tiger" || type === "leopard") && (
          <group>
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
        )}

        {/* WOLF & DOG POINTED EARS */}
        {(type === "wolf" || type === "dog") && (
          <group>
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
        )}

        {/* CAT: Pointed Ears + Vietnamese Nón Lá (Conical Hat)! */}
        {type === "cat" && (
          <group>
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
        )}

        {/* MOUSE: Oversized Round Ears + Golden Rice Stalk (Bông lúa) */}
        {type === "mouse" && (
          <group>
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
            {/* Khăn Đầu Đỏ / Xanh */}
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.16, 0.025, 8, 20]} />
              <meshStandardMaterial color={teamRibbonColor} />
            </mesh>
          </group>
        )}
      </group>

      {/* ANIMATED TAIL */}
      <group ref={tailRef} position={[0, 0.24, -0.24]}>
        <mesh position={[0, 0.08, -0.08]} rotation={[-0.6, 0, 0]} castShadow>
          <capsuleGeometry args={[0.036, 0.22, 8, 10]} />
          <meshStandardMaterial
            color={type === "mouse" ? "#FFB5A7" : meta.primaryColor}
            roughness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

const SHORT_NAME_VI: Record<AnimalType, string> = {
  elephant: "Voi",
  lion: "Sư Tử",
  tiger: "Hổ",
  leopard: "Báo",
  wolf: "Sói",
  dog: "Chó",
  cat: "Mèo",
  mouse: "Chuột",
};

function RankBadgeSprite({
  rankText,
  shortName,
  isRed,
  isSelected,
}: {
  rankText: string;
  shortName: string;
  isRed: boolean;
  isSelected: boolean;
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 88;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pill background
    const x = 10;
    const y = 10;
    const w = 236;
    const h = 68;
    const r = 34;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = isRed ? "rgba(214, 40, 40, 0.95)" : "rgba(3, 105, 161, 0.95)";
    ctx.fill();
    ctx.lineWidth = isSelected ? 6 : 4;
    ctx.strokeStyle = isSelected ? "#FFE66D" : "#FDE68A";
    ctx.stroke();

    // Draw golden circular rank badge on the left
    ctx.beginPath();
    ctx.arc(46, 44, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#FCD34D";
    ctx.fill();

    // Rank number inside golden circle
    ctx.fillStyle = "#1C1917";
    ctx.font = "900 30px 'Be Vietnam Pro', 'Segoe UI', Tahoma, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rankText, 46, 46);

    // Animal Vietnamese short name
    ctx.fillStyle = "#FFFBEB";
    ctx.font = "800 30px 'Be Vietnam Pro', 'Segoe UI', Tahoma, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shortName, 148, 45);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [rankText, shortName, isRed, isSelected]);

  if (!texture) return null;

  return (
    <sprite
      position={[0, 1.12, 0]}
      scale={isSelected ? [0.98, 0.34, 1] : [0.86, 0.3, 1]}
      raycast={() => null}
    >
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

interface GamePieceProps {
  piece: GamePieceType;
}

export function GamePiece({ piece }: GamePieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const activeAnimation = useGameStore((s) => s.activeAnimation);
  const invalidMoveFeedback = useGameStore((s) => s.invalidMoveFeedback);
  const handleCellOrPieceClick = useGameStore((s) => s.handleCellOrPieceClick);
  const showRankBadges = useSettingsStore((s) => s.showRankBadges);

  const isSelected = selectedPiece?.id === piece.id;
  const isRed = piece.player === "red";
  const inRiver = isRiverCell(piece.position);
  const weakenedInTrap = isInOpponentTrap(piece.position, piece.player);

  // Unique phase offset per piece so idle animations are organic and desynchronized
  const animPhaseOffset = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < piece.id.length; i++) {
      hash = piece.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 100) * 0.1;
  }, [piece.id]);

  // Default facing direction: Red faces -Z (toward Blue at top), Blue faces +Z (toward Red at bottom)
  const defaultYaw = isRed ? Math.PI : 0;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const now = performance.now();
    const baseYOffset = inRiver ? 0.12 : 0.22;

    // 1. Check if this piece is currently the moving piece in `activeAnimation`
    if (activeAnimation && activeAnimation.pieceId === piece.id) {
      const elapsed = now - activeAnimation.startTime;
      const progress = Math.min(1, elapsed / activeAnimation.duration);
      const transform = interpolateMoveTransform(
        activeAnimation.from,
        activeAnimation.to,
        activeAnimation.moveType,
        progress,
        baseYOffset
      );

      groupRef.current.position.set(...transform.position);
      groupRef.current.scale.setScalar(transform.scaleMultiplier);
      groupRef.current.rotation.set(transform.pitchAngle, transform.targetYaw, 0);
      return;
    }

    // 2. Check if this piece is currently the DEFENDER being captured in `activeAnimation`
    if (activeAnimation && activeAnimation.capturedPiece?.id === piece.id) {
      const elapsed = now - activeAnimation.startTime;
      const progress = Math.min(1, elapsed / activeAnimation.duration);
      const [wx, wy, wz] = boardToWorldPosition(piece.position, baseYOffset);

      if (progress < 0.55) {
        // Brace for impact
        groupRef.current.position.set(wx, wy, wz);
        groupRef.current.scale.setScalar(1);
      } else {
        // Knocked away & spun on impact!
        const hitT = (progress - 0.55) / 0.45;
        const knockY = wy + Math.sin(hitT * Math.PI) * 1.1;
        const shrink = Math.max(0.01, 1 - hitT * 0.95);
        groupRef.current.position.set(
          wx + (isRed ? -0.35 : 0.35) * hitT,
          knockY,
          wz + (isRed ? 0.45 : -0.45) * hitT
        );
        groupRef.current.rotation.set(hitT * 4, defaultYaw + hitT * 8, hitT * 3);
        groupRef.current.scale.setScalar(shrink);
      }
      return;
    }

    // 3. Standard static/idle state on its cell
    const [targetX, targetY, targetZ] = boardToWorldPosition(piece.position, baseYOffset);

    // Selection bounce
    const selectBounce = isSelected
      ? Math.abs(Math.sin(clock.getElapsedTime() * 5.2)) * 0.16 + 0.06
      : 0;

    // Invalid move shake feedback
    let shakeX = 0;
    if (
      invalidMoveFeedback &&
      invalidMoveFeedback.pieceId === piece.id &&
      Date.now() - invalidMoveFeedback.timestamp < 500
    ) {
      const shakeElapsed = (Date.now() - invalidMoveFeedback.timestamp) / 500;
      shakeX = Math.sin(shakeElapsed * Math.PI * 10) * 0.12 * (1 - shakeElapsed);
    }

    // Hover scale interpolation
    const targetScale = isSelected ? 1.12 : hovered ? 1.08 : 1.0;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX + shakeX,
      0.22
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY + selectBounce,
      0.22
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      0.22
    );

    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.2);
    groupRef.current.scale.setScalar(nextScale);

    // Smoothly return rotation to default facing orientation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.2);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.2);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      defaultYaw,
      0.18
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    handleCellOrPieceClick(piece.position);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (typeof document !== "undefined") {
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (typeof document !== "undefined") {
      document.body.style.cursor = "auto";
    }
  };

  const pedestalMainColor = isRed ? "#D62828" : "#1D63B8";
  const pedestalRimColor = isSelected
    ? "#FFE66D"
    : hovered
    ? "#FFF3B0"
    : "#F4A261";

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* VIETNAMESE LACQUER & GOLD BASE PEDESTAL */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.47, 0.11, 28]} />
        <meshStandardMaterial
          color={pedestalMainColor}
          roughness={0.32}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.095, 0]} receiveShadow>
        <cylinderGeometry args={[0.38, 0.41, 0.03, 28]} />
        <meshStandardMaterial
          color={pedestalRimColor}
          roughness={0.28}
          metalness={0.45}
        />
      </mesh>

      {/* SELECTION OR HOVER AURA RING */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.46, 0.56, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#FFD166" : currentPlayer === piece.player ? "#90E0EF" : "#FF758F"}
            transparent
            opacity={isSelected ? 0.92 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D VIETNAMESE ANIMAL CHARACTER */}
      <VietnameseStylizedAnimalMesh
        type={piece.type}
        isRed={isRed}
        animPhaseOffset={animPhaseOffset}
      />

      {/* FLOATING RANK & NAME BADGE (Pure WebGL Sprite - Zero DOM Unmount Race Conditions) */}
      {(showRankBadges || hovered || isSelected) && (
        <RankBadgeSprite
          rankText={weakenedInTrap ? "0" : String(piece.rank)}
          shortName={SHORT_NAME_VI[piece.type]}
          isRed={isRed}
          isSelected={isSelected}
        />
      )}
    </group>
  );
}

