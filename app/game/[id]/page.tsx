"use client";

import React, { Suspense, use, useEffect, useRef } from "react";
import { GameScene } from "@/components/game/GameScene";
import { GameMenu } from "@/components/ui/GameMenu";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { VictoryModal } from "@/components/ui/VictoryModal";
import { OnlineGameSessionManager } from "@/game/network";
import { useGameStore } from "@/stores/gameStore";
import { isSamePosition } from "@/game/rules";
import { getPieceAt, getValidMovesForPiece } from "@/game/gameEngine";

function RoomSessionContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomCode = (resolvedParams.id || "VN888").toUpperCase();

  const startGame = useGameStore((s) => s.startGame);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const sessionRef = useRef<OnlineGameSessionManager | null>(null);
  const lastBroadcastedCountRef = useRef<number>(0);

  useEffect(() => {
    startGame("online", "normal", roomCode);

    const state = useGameStore.getState();
    const session = new OnlineGameSessionManager(roomCode, state);
    sessionRef.current = session;
    session.connect(roomCode, "Kỳ Thủ Đại Ngàn");

    session.onTurnReceived((payload) => {
      const current = useGameStore.getState();
      const piece = getPieceAt(current.pieces, payload.from);
      if (!piece) return;

      const moves = getValidMovesForPiece(piece, current.pieces);
      const valid = moves.find((m) => isSamePosition(m.to, payload.to));
      if (valid) {
        lastBroadcastedCountRef.current = current.moveHistory.length + 1;
        current.executeValidMove(valid);
      }
    });

    return () => {
      session.disconnect();
      sessionRef.current = null;
    };
  }, [roomCode, startGame]);

  // Broadcast local moves to connected room peers
  useEffect(() => {
    if (
      sessionRef.current &&
      moveHistory.length > lastBroadcastedCountRef.current
    ) {
      const latest = moveHistory[moveHistory.length - 1];
      lastBroadcastedCountRef.current = moveHistory.length;
      sessionRef.current.sendTurn({
        roomId: roomCode,
        player: latest.player,
        pieceId: latest.pieceId,
        from: latest.from,
        to: latest.to,
        timestamp: latest.timestamp,
      });
    }
  }, [moveHistory, roomCode]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none">
      <GameScene isMenuPreview={false} />
      <GameMenu />
      <SettingsPanel />
      <VictoryModal />
    </main>
  );
}

export default function OnlineRoomGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-sky-200 text-amber-950 font-black text-lg">
          Đang kết nối Phòng Đại Ngàn...
        </div>
      }
    >
      <RoomSessionContent params={params} />
    </Suspense>
  );
}
