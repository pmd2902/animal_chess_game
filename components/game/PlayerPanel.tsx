"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crown, Bot, User } from "lucide-react";
import { AnimalType, Player } from "@/game/gameTypes";
import { ANIMAL_METADATA } from "@/game/rules";
import { useGameStore } from "@/stores/gameStore";

const ANIMAL_EMOJI: Record<AnimalType, string> = {
  elephant: "🐘",
  lion: "🦁",
  tiger: "🐯",
  leopard: "🐆",
  wolf: "🐺",
  dog: "🐕",
  cat: "🐱",
  mouse: "🐭",
};

interface PlayerPanelProps {
  player: Player;
}

export function PlayerPanel({ player }: PlayerPanelProps) {
  const pieces = useGameStore((s) => s.pieces);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const capturedPieces = useGameStore((s) => s.capturedPieces);
  const playerNames = useGameStore((s) => s.playerNames);
  const gameMode = useGameStore((s) => s.gameMode);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const selectPiece = useGameStore((s) => s.selectPiece);

  const isRed = player === "red";
  const isActiveTurn = currentPlayer === player;
  const remainingPieces = pieces
    .filter((p) => p.player === player)
    .sort((a, b) => b.rank - a.rank);

  // Pieces captured BY this player (i.e. opponent pieces eliminated)
  const defeatedEnemies = isRed ? capturedPieces.blue : capturedPieces.red;

  return (
    <motion.div
      animate={{
        scale: isActiveTurn ? 1.02 : 0.97,
        y: isActiveTurn ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`pointer-events-auto w-60 sm:w-72 rounded-2xl p-3 sm:p-3.5 shadow-xl border-2 backdrop-blur-md transition-colors ${
        isRed
          ? isActiveTurn
            ? "bg-amber-50/95 border-red-500 ring-4 ring-red-400/30"
            : "bg-amber-50/80 border-amber-200/80 opacity-90"
          : isActiveTurn
          ? "bg-sky-50/95 border-sky-500 ring-4 ring-sky-400/30"
          : "bg-sky-50/80 border-sky-200/80 opacity-90"
      }`}
    >
      {/* Header: Avatar, Player Name, Remaining Count */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border ${
              isRed
                ? "bg-gradient-to-br from-red-500 to-amber-500 text-white border-red-300"
                : "bg-gradient-to-br from-sky-600 to-teal-500 text-white border-sky-300"
            }`}
          >
            {isRed ? (
              "🐯"
            ) : gameMode === "single" ? (
              <Bot className="w-5 h-5" />
            ) : (
              "🐘"
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-stone-800 truncate">
                {playerNames[player]}
              </span>
              {isActiveTurn && (
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-bounce" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600">
              <span className="inline-flex items-center gap-0.5">
                <User className="w-3 h-3" /> Còn {remainingPieces.length}/8 linh thú
              </span>
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            isActiveTurn
              ? isRed
                ? "bg-red-600 text-white"
                : "bg-sky-600 text-white"
              : "bg-stone-200 text-stone-600"
          }`}
        >
          {isActiveTurn ? "Đang đi" : "Chờ"}
        </span>
      </div>

      {/* Active Pieces Mini-Grid (Clickable on your turn to quickly select a piece!) */}
      <div className="grid grid-cols-4 gap-1 bg-white/75 rounded-xl p-1.5 border border-stone-200/70">
        {remainingPieces.map((p) => {
          const isSelected = selectedPiece?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPiece(p)}
              title={`${p.nameVi} (Bậc ${p.rank}) - ${ANIMAL_METADATA[p.type].specialAbilityVi}`}
              className={`flex items-center justify-center gap-0.5 px-1.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? "bg-amber-300 text-stone-900 ring-2 ring-red-500 scale-105"
                  : "hover:bg-amber-100/80 text-stone-700"
              }`}
            >
              <span>{ANIMAL_EMOJI[p.type]}</span>
              <span className="text-[10px] font-extrabold text-stone-500">
                {p.rank}
              </span>
            </button>
          );
        })}
      </div>

      {/* Captured Enemy Pieces Row */}
      {defeatedEnemies.length > 0 && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-stone-600 font-semibold overflow-x-auto">
          <span className="shrink-0">Thu phục:</span>
          <div className="flex items-center gap-0.5">
            {defeatedEnemies.map((cap) => (
              <span
                key={cap.id}
                title={`Đã thu phục ${cap.nameVi}`}
                className="inline-block text-xs bg-stone-200/80 px-1 rounded"
              >
                {ANIMAL_EMOJI[cap.type]}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

