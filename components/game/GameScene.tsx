"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GameBoard } from "./GameBoard";
import { GamePiece } from "./GamePiece";
import { GameEnvironment } from "./GameEnvironment";
import { CameraController } from "./CameraController";
import { GameEffects } from "./GameEffects";
import { useGameStore } from "@/stores/gameStore";

interface GameSceneProps {
  isMenuPreview?: boolean;
}

export function GameScene({ isMenuPreview = false }: GameSceneProps) {
  const gameSessionId = useGameStore((s) => s.gameSessionId);
  const pieces = useGameStore((s) => s.pieces);
  const selectPiece = useGameStore((s) => s.selectPiece);

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 11.8, 10.6], fov: 42, near: 0.2, far: 140 }}
        onPointerMissed={() => {
          if (!isMenuPreview) {
            selectPiece(null);
          }
        }}
      >
        {/* Warm Vietnamese Mountain Valley Sky & Atmospheric Fog */}
        <color attach="background" args={["#A9DEF9"]} />
        <fog attach="fog" args={["#CAE9FF", 40, 92]} />

        {/* Soft Natural Lighting */}
        <ambientLight intensity={0.78} color="#FFF8F0" />
        <hemisphereLight
          args={["#A9DEF9", "#74C69D", 0.65]}
          position={[0, 20, 0]}
        />
        <directionalLight
          castShadow
          position={[10, 16, 8]}
          intensity={1.45}
          color="#FFF3B0"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={40}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0005}
        />
        {/* Rim Light */}
        <directionalLight
          position={[-8, 6, -10]}
          intensity={0.45}
          color="#90E0EF"
        />

        <Suspense fallback={null}>
          <GameEnvironment />
          <GameBoard />
          {pieces.map((piece) => (
            <GamePiece key={`${gameSessionId}-${piece.id}`} piece={piece} />
          ))}
          <GameEffects />
          <CameraController isMenuPreview={isMenuPreview} />
        </Suspense>
      </Canvas>
    </div>
  );
}
