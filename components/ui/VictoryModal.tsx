"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Home, Sparkles, ShieldAlert } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";

export function VictoryModal() {
  const router = useRouter();
  const status = useGameStore((s) => s.status);
  const gameMode = useGameStore((s) => s.gameMode);
  const winner = useGameStore((s) => s.winner);
  const winReasonVi = useGameStore((s) => s.winReasonVi);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const playerNames = useGameStore((s) => s.playerNames);
  const resetGame = useGameStore((s) => s.resetGame);
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  const isOpen = status === "victory" && Boolean(winner);
  const isPlayerDefeatedByAI = gameMode === "single" && winner === "blue";

  useEffect(() => {
    if (!isOpen || isPlayerDefeatedByAI) return;

    // Launch Vietnamese festival confetti burst only on victory
    const duration = 2600;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#E63946", "#FFD166", "#06D6A0", "#118AB2"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#E63946", "#FFD166", "#06D6A0", "#118AB2"],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen, isPlayerDefeatedByAI]);

  if (!isOpen || !winner) return null;

  const isRedWinner = winner === "red";

  const handleBackToMenu = () => {
    returnToMenu();
    router.push("/");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-sm pointer-events-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`relative w-full max-w-md rounded-3xl border-4 shadow-2xl p-7 text-center text-stone-800 ${
            isPlayerDefeatedByAI
              ? "bg-gradient-to-b from-slate-50 via-stone-100 to-sky-100 border-slate-400"
              : "bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100 border-amber-400"
          }`}
        >
          {/* Floating Badge (Trophy on Victory, ShieldAlert on Defeat) */}
          <div
            className={`mx-auto -mt-14 mb-3 w-20 h-20 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center ${
              isPlayerDefeatedByAI
                ? "bg-gradient-to-br from-slate-500 via-sky-700 to-slate-800"
                : "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500"
            }`}
          >
            {isPlayerDefeatedByAI ? (
              <ShieldAlert className="w-10 h-10 text-white" />
            ) : (
              <Trophy className="w-10 h-10 text-stone-950 animate-bounce" />
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest mb-2 ${
              isPlayerDefeatedByAI
                ? "bg-slate-200/90 text-slate-800"
                : "bg-amber-200/90 text-amber-950"
            }`}
          >
            {isPlayerDefeatedByAI ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-sky-700" />
                <span>Thử Thách Đại Ngàn</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Khải Hoàn Đại Ngàn</span>
              </>
            )}
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 ${
              isPlayerDefeatedByAI ? "text-slate-900" : "text-amber-950"
            }`}
          >
            {isPlayerDefeatedByAI ? "THUA CUỘC!" : "CHIẾN THẮNG!"}
          </h2>

          <p
            className={`text-lg font-extrabold mb-3 ${
              isRedWinner ? "text-red-600" : "text-sky-700"
            }`}
          >
            {isPlayerDefeatedByAI
              ? `${playerNames[winner]} Đã Thắng Ván Này — Phục Thù Nhé!`
              : `${playerNames[winner]} Đã Giành Chiến Thắng!`}
          </p>

          <div
            className={`bg-white/85 rounded-2xl p-4 border shadow-inner mb-6 space-y-1.5 ${
              isPlayerDefeatedByAI ? "border-slate-200" : "border-amber-200"
            }`}
          >
            <p className="text-sm font-bold text-stone-700">{winReasonVi}</p>
            <p className="text-xs text-stone-500 font-semibold">
              Tổng số hiệp đấu: {moveHistory.length} nước đi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetGame}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg border-2 border-emerald-200 transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isPlayerDefeatedByAI ? "PHỤC THÙ" : "CHƠI LẠI"}</span>
            </button>

            <button
              type="button"
              onClick={handleBackToMenu}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-stone-950 font-black text-sm shadow-lg border-2 border-amber-200 transition-transform active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>VỀ MENU</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

