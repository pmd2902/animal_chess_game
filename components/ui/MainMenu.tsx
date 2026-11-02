"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Users,
  BookOpen,
  Settings,
  Sparkles,
  Trees,
} from "lucide-react";
import { GameScene } from "@/components/game/GameScene";
import { ModeSelector } from "./ModeSelector";
import { SettingsPanel } from "./SettingsPanel";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function MainMenu() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);
  const setModeSelectorOpen = useSettingsStore((s) => s.setModeSelectorOpen);
  const setGuideOpen = useSettingsStore((s) => s.setGuideOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  const handleQuickPlay = () => {
    startGame("single", "normal");
    router.push("/game");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none">
      {/* 3D ANIMATED VIETNAMESE MOUNTAIN VALLEY & BOARD BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <GameScene isMenuPreview={true} />
      </div>

      {/* SOFT SUNLIGHT VIGNETTE OVERLAY */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-sky-900/20 via-transparent to-emerald-950/35" />

      {/* MAIN MENU CONTENT */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-none">
        {/* Top Tagline Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/90 border-2 border-amber-300 shadow-lg text-amber-950 text-xs sm:text-sm font-extrabold"
        >
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>Trò Chơi Dân Gian & Linh Thú 3D Việt Nam</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </motion.div>

        {/* Center Hero Card: Title + Subtitle + 4 Main Buttons */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-auto w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-50/95 via-orange-50/95 to-amber-100/95 backdrop-blur-md border-4 border-amber-400 shadow-2xl p-6 sm:p-8 text-center"
        >
          {/* Decorative Vietnamese Lotus Emblem */}
          <div className="mx-auto -mt-12 mb-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 p-1 shadow-xl border-2 border-amber-100 flex items-center justify-center text-3xl">
            🐯
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-950 drop-shadow-sm">
            CỜ THÚ VIỆT NAM
          </h1>
          <p className="mt-1.5 text-sm sm:text-base font-bold text-emerald-800 mb-6">
            “Cuộc phiêu lưu giữa đại ngàn”
          </p>

          <div className="space-y-3">
            {/* [ CHƠI NGAY ] */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuickPlay}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base sm:text-lg shadow-lg border-2 border-amber-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CHƠI NGAY</span>
            </motion.button>

            {/* [ NHIỀU NGƯỜI CHƠI ] */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModeSelectorOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-md border-2 border-emerald-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Users className="w-5 h-5" />
              <span>NHIỀU NGƯỜI CHƠI & CHẾ ĐỘ</span>
            </motion.button>

            {/* [ HƯỚNG DẪN ] & [ CÀI ĐẶT ] */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGuideOpen(true)}
                className="py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-sm shadow border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>HƯỚNG DẪN</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSettingsOpen(true)}
                className="py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-sm shadow border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-amber-700" />
                <span>CÀI ĐẶT</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Animal Preview Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-200 shadow text-xs font-bold text-stone-700 flex flex-wrap items-center justify-center gap-3"
        >
          <span>🐘 Voi Bản Đôn</span>
          <span>•</span>
          <span>🦁 Sư Tử Sơn Lâm</span>
          <span>•</span>
          <span>🐯 Hổ Đông Dương</span>
          <span>•</span>
          <span>🐕 Chó Phú Quốc</span>
          <span>•</span>
          <span>🐱 Mèo Nón Lá</span>
          <span>•</span>
          <span>🐭 Chuột Đồng</span>
        </motion.div>
      </div>

      {/* Modals */}
      <ModeSelector />
      <SettingsPanel />
    </div>
  );
}

