"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, ShieldAlert } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";

export function TurnIndicator() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const isAIThinking = useGameStore((s) => s.isAIThinking);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const invalidMoveFeedback = useGameStore((s) => s.invalidMoveFeedback);
  const moveHistory = useGameStore((s) => s.moveHistory);

  const isRed = currentPlayer === "red";

  return (
    <div className="flex flex-col items-center gap-1 pointer-events-auto">
      <motion.div
        key={currentPlayer + (isAIThinking ? "-ai" : "")}
        initial={{ y: -12, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className={`flex items-center gap-1.5 sm:gap-2.5 px-3.5 py-1 sm:px-5 sm:py-2 rounded-full shadow-lg border-2 backdrop-blur-md ${
          isRed
            ? "bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white border-amber-200"
            : "bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 text-white border-sky-200"
        }`}
      >
        {isAIThinking ? (
          <>
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-amber-200" />
            <span className="font-extrabold text-xs sm:text-base tracking-wide">
              AI đang suy nghĩ...
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-200 animate-pulse" />
            <span className="font-extrabold text-xs sm:text-base tracking-wide">
              {isRed ? "Lượt Đội Hồng Lạc (Đỏ)" : "Lượt Đội Lam Sơn (Xanh)"}
            </span>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-black/20 font-semibold">
              Lượt #{moveHistory.length + 1}
            </span>
          </>
        )}
      </motion.div>

      {/* Selected Piece Quick Info or Invalid Move Banner */}
      <AnimatePresence mode="wait">
        {invalidMoveFeedback ? (
          <motion.div
            key={`err-${invalidMoveFeedback.timestamp}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-600/95 text-white text-xs font-bold shadow border border-red-200"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{invalidMoveFeedback.reasonVi}</span>
          </motion.div>
        ) : selectedPiece ? (
          <motion.div
            key={`sel-${selectedPiece.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-3.5 py-1 rounded-full bg-amber-100/95 text-amber-950 text-xs font-bold shadow border border-amber-300"
          >
            Đang chọn: <span className="text-red-700">{selectedPiece.nameVi}</span> (Bậc{" "}
            {selectedPiece.rank}) — Chọn ô sáng để di chuyển
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

