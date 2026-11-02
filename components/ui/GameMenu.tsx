"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Volume2,
  VolumeX,
  Settings,
  RotateCcw,
  Undo2,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Compass,
  Pause,
  Play,
} from "lucide-react";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function GameMenu() {
  const router = useRouter();
  const gameMode = useGameStore((s) => s.gameMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const status = useGameStore((s) => s.status);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const roomCode = useGameStore((s) => s.roomCode);

  const resetGame = useGameStore((s) => s.resetGame);
  const undoMove = useGameStore((s) => s.undoMove);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  const cameraView = useSettingsStore((s) => s.cameraView);
  const toggleCameraView = useSettingsStore((s) => s.toggleCameraView);
  const zoomIn = useSettingsStore((s) => s.zoomIn);
  const zoomOut = useSettingsStore((s) => s.zoomOut);
  const resetCamera = useSettingsStore((s) => s.resetCamera);
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const toggleSfx = useSettingsStore((s) => s.toggleSfx);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const setGuideOpen = useSettingsStore((s) => s.setGuideOpen);

  const handleBackToMenu = () => {
    returnToMenu();
    router.push("/");
  };

  const modeBadgeText =
    gameMode === "single"
      ? `Đấu AI (${
          difficulty === "easy"
            ? "Dễ"
            : difficulty === "normal"
            ? "Vừa"
            : "Khó"
        })`
      : gameMode === "online"
      ? `Phòng #${roomCode ?? "VN888"}`
      : "2 Người Chơi";

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* TOP BAR: Top-Left (Back + Mode + Controls), Top-Center (Turn Indicator), Top-Right (Camera + Audio + Settings) */}
      <div className="flex items-start justify-between gap-2">
        {/* TOP-LEFT */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleBackToMenu}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-stone-800 font-extrabold text-xs sm:text-sm shadow-md border-2 border-amber-300 transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span className="hidden sm:inline">Về Menu</span>
          </button>

          <div className="px-3 py-2 rounded-2xl bg-emerald-700/90 text-amber-50 font-extrabold text-xs shadow-md border border-emerald-400">
            {modeBadgeText}
          </div>

          <button
            type="button"
            onClick={undoMove}
            disabled={moveHistory.length === 0}
            title="Đi lại nước trước"
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 disabled:opacity-45 text-stone-800 font-bold text-xs shadow-md border-2 border-amber-300 transition-transform active:scale-95"
          >
            <Undo2 className="w-4 h-4 text-amber-700" />
            <span className="hidden md:inline">Đi lại</span>
          </button>

          <button
            type="button"
            onClick={resetGame}
            title="Ván mới"
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-stone-800 font-bold text-xs shadow-md border-2 border-amber-300 transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">Ván mới</span>
          </button>

          <button
            type="button"
            onClick={status === "paused" ? resumeGame : pauseGame}
            title="Tạm dừng"
            className="p-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-stone-800 shadow-md border-2 border-amber-300"
          >
            {status === "paused" ? (
              <Play className="w-4 h-4 text-emerald-700" />
            ) : (
              <Pause className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>

        {/* TOP-CENTER: Turn Indicator */}
        <div className="hidden lg:block">
          <TurnIndicator />
        </div>

        {/* TOP-RIGHT: Camera Toggle, Zoom, Guide, Sound, Settings */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleCameraView}
            title="Đổi góc nhìn Camera (3D Nghiêng / Từ Trên Xuống)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-600/95 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md border-2 border-sky-300 transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{cameraView === "isometric" ? "Góc 3D" : "Từ Trên"}</span>
          </button>

          <div className="hidden sm:flex items-center bg-amber-50/95 rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden">
            <button
              type="button"
              onClick={zoomIn}
              title="Phóng to"
              className="p-2 hover:bg-amber-100 text-stone-700"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              title="Thu nhỏ"
              className="p-2 hover:bg-amber-100 text-stone-700 border-l border-amber-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetCamera}
              title="Đặt lại góc quay"
              className="p-2 hover:bg-amber-100 text-stone-700 border-l border-amber-200"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            title="Hướng dẫn luật chơi"
            className="p-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-emerald-800 shadow-md border-2 border-amber-300"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSfx}
            title={sfxEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            className="p-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-stone-800 shadow-md border-2 border-amber-300"
          >
            {sfxEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title="Cài đặt"
            className="p-2 rounded-2xl bg-amber-50/95 hover:bg-amber-100 text-stone-800 shadow-md border-2 border-amber-300"
          >
            <Settings className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET TURN INDICATOR ROW */}
      <div className="lg:hidden flex justify-center -mt-1">
        <TurnIndicator />
      </div>

      {/* BOTTOM BAR: Bottom-Left (Player 1 - Red), Bottom-Right (Player 2 - Blue) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2.5">
        <PlayerPanel player="red" />
        <PlayerPanel player="blue" />
      </div>

      {/* PAUSE OVERLAY MODAL */}
      <AnimatePresence>
        {status === "paused" && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-amber-50 border-4 border-amber-400 shadow-2xl p-6 text-center text-stone-800 space-y-4"
            >
              <h3 className="text-2xl font-black text-amber-950">
                Đang Tạm Dừng
              </h3>
              <p className="text-xs text-stone-600 font-semibold">
                Hãy nghỉ ngơi một chút giữa đại ngàn trước khi tiếp tục ván cờ!
              </p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={resumeGame}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow"
                >
                  TIẾP TỤC CHƠI
                </button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="w-full py-3 rounded-2xl bg-amber-300 hover:bg-amber-400 text-stone-900 font-black text-sm shadow"
                >
                  CHƠI LẠI TỪ ĐẦU
                </button>
                <button
                  type="button"
                  onClick={handleBackToMenu}
                  className="w-full py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm"
                >
                  VỀ MENU CHÍNH
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

