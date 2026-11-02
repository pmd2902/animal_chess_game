"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { AnimalType, GamePiece as GamePieceType } from "@/game/gameTypes";
import { isInOpponentTrap, isRiverCell } from "@/game/rules";
import {
  boardToWorldPosition,
  interpolateMoveTransform,
  lerpAngle,
} from "@/game/animations";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { AnimalModel } from "./animals";

/**
 * Note on 3D animal components & external assets:
 * Each playable animal is implemented as a standalone reusable 3D component in:
 *   components/game/animals/ElephantModel.tsx
 *   components/game/animals/LionModel.tsx
 *   components/game/animals/TigerModel.tsx
 *   components/game/animals/LeopardModel.tsx
 *   components/game/animals/WolfModel.tsx
 *   components/game/animals/DogModel.tsx
 *   components/game/animals/CatModel.tsx
 *   components/game/animals/MouseModel.tsx
 *
 * Custom GLB models (e.g. /public/models/elephant.glb) can easily be swapped inside
 * any individual animal component without affecting `GamePiece` or other animals.
 */

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
    ctx.fillStyle = isRed
      ? "rgba(214, 40, 40, 0.95)"
      : "rgba(3, 105, 161, 0.95)";
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
  const visualGroupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const handleCellOrPieceClick = useGameStore((s) => s.handleCellOrPieceClick);
  const showRankBadges = useSettingsStore((s) => s.showRankBadges);

  const isSelected = selectedPiece?.id === piece.id;
  const isRed = piece.player === "red";
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
  const hasInitializedRef = useRef(false);
  const takeoffRef = useRef<{
    animId: string;
    yBonus: number;
    scaleBonus: number;
  }>({
    animId: "",
    yBonus: 0,
    scaleBonus: 0,
  });

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !visualGroupRef.current) return;
    const now = performance.now();

    // Read directly from Zustand store inside useFrame to guarantee 100% atomic
    // synchronization between activeAnimation and piece.position (zero React prop tearing!)
    const store = useGameStore.getState();
    const livePiece = store.pieces.find((p) => p.id === piece.id) ?? piece;
    const liveAnim = store.activeAnimation;
    const liveSelected = store.selectedPiece?.id === piece.id;
    const liveInvalid = store.invalidMoveFeedback;
    const baseYOffset = isRiverCell(livePiece.position) ? 0.12 : 0.22;

    // Initialize position & yaw immediately on first frame so pieces never lerp from (0,0,0)
    if (!hasInitializedRef.current) {
      const [initX, initY, initZ] = boardToWorldPosition(
        livePiece.position,
        baseYOffset
      );
      groupRef.current.position.set(initX, initY, initZ);
      groupRef.current.rotation.set(0, defaultYaw, 0);
      groupRef.current.scale.setScalar(1);
      visualGroupRef.current.position.set(0, 0, 0);
      visualGroupRef.current.scale.setScalar(1);
      hasInitializedRef.current = true;
    }

    // 1. Check if this piece is currently the moving piece in `liveAnim`
    if (liveAnim && liveAnim.pieceId === piece.id) {
      // Capture exact elevation & scale from selection state on frame 0 of the move
      // so the piece never drops back down to the old cell before stepping forward!
      if (takeoffRef.current.animId !== liveAnim.id) {
        const [, startBaseY] = boardToWorldPosition(liveAnim.from, baseYOffset);
        const currentWorldY =
          groupRef.current.position.y + visualGroupRef.current.position.y;
        takeoffRef.current = {
          animId: liveAnim.id,
          yBonus: Math.max(0, currentWorldY - startBaseY),
          scaleBonus: Math.max(0, visualGroupRef.current.scale.x - 1),
        };
      }

      const elapsed = now - liveAnim.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / liveAnim.duration));
      const transform = interpolateMoveTransform(
        liveAnim.from,
        liveAnim.to,
        liveAnim.moveType,
        progress,
        baseYOffset,
        defaultYaw,
        takeoffRef.current.yBonus,
        takeoffRef.current.scaleBonus
      );

      groupRef.current.position.set(...transform.position);
      groupRef.current.rotation.set(
        transform.pitchAngle,
        transform.yawAngle,
        0
      );
      visualGroupRef.current.position.set(0, 0, 0);
      visualGroupRef.current.scale.setScalar(transform.scaleMultiplier);
      return;
    }

    // 2. Check if this piece is currently the DEFENDER being captured in `liveAnim`
    if (liveAnim && liveAnim.capturedPiece?.id === piece.id) {
      const elapsed = now - liveAnim.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / liveAnim.duration));
      const [wx, wy, wz] = boardToWorldPosition(
        livePiece.position,
        baseYOffset
      );

      if (progress < 0.55) {
        // Brace for impact
        groupRef.current.position.set(wx, wy, wz);
        visualGroupRef.current.position.set(0, 0, 0);
        visualGroupRef.current.scale.setScalar(1);
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
        groupRef.current.rotation.set(
          hitT * 4,
          defaultYaw + hitT * 8,
          hitT * 3
        );
        visualGroupRef.current.position.set(0, 0, 0);
        visualGroupRef.current.scale.setScalar(shrink);
      }
      return;
    }

    // 3. Standard static/idle state on its cell
    const [targetX, targetY, targetZ] = boardToWorldPosition(
      livePiece.position,
      baseYOffset
    );

    // Selection bounce
    const selectBounce = liveSelected
      ? Math.abs(Math.sin(clock.getElapsedTime() * 5.2)) * 0.16 + 0.06
      : 0;

    // Invalid move shake feedback
    let shakeX = 0;
    if (
      liveInvalid &&
      liveInvalid.pieceId === piece.id &&
      Date.now() - liveInvalid.timestamp < 500
    ) {
      const shakeElapsed = (Date.now() - liveInvalid.timestamp) / 500;
      shakeX =
        Math.sin(shakeElapsed * Math.PI * 10) * 0.12 * (1 - shakeElapsed);
    }

    // Hover scale interpolation (applied ONLY to visualGroupRef so hitbox never oscillates!)
    const isHovered = hoveredRef.current;
    const targetScale = liveSelected ? 1.12 : isHovered ? 1.06 : 1.0;
    const targetHoverLift = !liveSelected && isHovered ? 0.035 : 0;
    const smoothFactor = Math.min(1, 1 - Math.exp(-16 * delta));

    // Keep outer groupRef anchored smoothly to exact board cell coordinates (hitbox stays rock-solid!)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      smoothFactor
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      smoothFactor
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      smoothFactor
    );
    groupRef.current.scale.setScalar(1);

    // Apply visual bounce, shake, and hover scale strictly on visualGroupRef
    visualGroupRef.current.position.x = THREE.MathUtils.lerp(
      visualGroupRef.current.position.x,
      shakeX,
      smoothFactor
    );
    visualGroupRef.current.position.y = THREE.MathUtils.lerp(
      visualGroupRef.current.position.y,
      selectBounce + targetHoverLift,
      smoothFactor
    );
    visualGroupRef.current.position.z = 0;

    const currentScale = visualGroupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(
      currentScale,
      targetScale,
      smoothFactor
    );
    visualGroupRef.current.scale.setScalar(nextScale);

    // Smoothly return rotation to default facing orientation using shortest angular path
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      0,
      smoothFactor
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      0,
      smoothFactor
    );
    groupRef.current.rotation.y = lerpAngle(
      groupRef.current.rotation.y,
      defaultYaw,
      smoothFactor
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    handleCellOrPieceClick(piece.position);
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!hoveredRef.current) {
      hoveredRef.current = true;
      setHovered(true);
    }
    if (typeof document !== "undefined") {
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerLeave = () => {
    if (hoveredRef.current) {
      hoveredRef.current = false;
      setHovered(false);
    }
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
    <group ref={groupRef}>
      {/* STATIC INVISIBLE HITBOX CYLINDER:
          Handles all pointer events on a single convex stationary shape so R3F never
          raycasts 400+ animated sub-meshes and hover never flickers at piece edges! */}
      <mesh
        position={[0, 0.45, 0]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[0.45, 0.48, 0.92, 12]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>

      {/* VISUAL GROUP: Scales, bounces, and shakes independently of the static hitbox */}
      <group ref={visualGroupRef}>
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

        {/* SELECTION OR HOVER AURA RING (Kept mounted with `visible` toggle for zero GPU stutter) */}
        <mesh
          visible={isSelected || hovered}
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <ringGeometry args={[0.46, 0.56, 32]} />
          <meshBasicMaterial
            color={
              isSelected
                ? "#FFD166"
                : currentPlayer === piece.player
                  ? "#90E0EF"
                  : "#FF758F"
            }
            transparent
            depthWrite={false}
            opacity={isSelected ? 0.92 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* STANDALONE REUSABLE 3D ANIMAL MODEL COMPONENT */}
        <AnimalModel
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
    </group>
  );
}
