"use client";

import React, { useEffect } from "react";
import { GameScene } from "@/components/game/GameScene";
import { GameMenu } from "@/components/ui/GameMenu";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { VictoryModal } from "@/components/ui/VictoryModal";
import { useGameStore } from "@/stores/gameStore";

export default function GamePage() {
  useEffect(() => {
    if (useGameStore.getState().status === "menu") {
      useGameStore.getState().startGame();
    }
  }, []);

  return (
    <main className="relative w-dvw h-dvh overflow-hidden bg-sky-200 select-none">
      <GameScene isMenuPreview={false} />
      <GameMenu />
      <SettingsPanel />
      <VictoryModal />
    </main>
  );
}

