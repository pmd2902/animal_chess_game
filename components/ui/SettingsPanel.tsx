"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Trees,
  Camera,
  Eye,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { ANIMAL_METADATA } from "@/game/rules";
import { AnimalType } from "@/game/gameTypes";

const ORDERED_ANIMALS: AnimalType[] = [
  "elephant",
  "lion",
  "tiger",
  "leopard",
  "wolf",
  "dog",
  "cat",
  "mouse",
];

const ANIMAL_ICONS: Record<AnimalType, string> = {
  elephant: "🐘",
  lion: "🦁",
  tiger: "🐯",
  leopard: "🐆",
  wolf: "🐺",
  dog: "🐕",
  cat: "🐱",
  mouse: "🐭",
};

export function SettingsPanel() {
  const isSettingsOpen = useSettingsStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const isGuideOpen = useSettingsStore((s) => s.isGuideOpen);
  const setGuideOpen = useSettingsStore((s) => s.setGuideOpen);

  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const ambientEnabled = useSettingsStore((s) => s.ambientEnabled);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const musicVolume = useSettingsStore((s) => s.musicVolume);
  const cameraView = useSettingsStore((s) => s.cameraView);
  const cameraSensitivity = useSettingsStore((s) => s.cameraSensitivity);
  const showMoveHints = useSettingsStore((s) => s.showMoveHints);
  const showRankBadges = useSettingsStore((s) => s.showRankBadges);

  const toggleSfx = useSettingsStore((s) => s.toggleSfx);
  const toggleMusic = useSettingsStore((s) => s.toggleMusic);
  const toggleAmbient = useSettingsStore((s) => s.toggleAmbient);
  const setSfxVolume = useSettingsStore((s) => s.setSfxVolume);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);
  const setCameraView = useSettingsStore((s) => s.setCameraView);
  const setCameraSensitivity = useSettingsStore((s) => s.setCameraSensitivity);
  const toggleMoveHints = useSettingsStore((s) => s.toggleMoveHints);
  const toggleRankBadges = useSettingsStore((s) => s.toggleRankBadges);

  return (
    <>
      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-400 shadow-2xl p-6 text-stone-800"
            >
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-200/80 hover:bg-amber-300 flex items-center justify-center text-stone-700"
                aria-label="Đóng cài đặt"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-amber-950 mb-5 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <span>Cài Đặt Trò Chơi</span>
              </h2>

              <div className="space-y-4">
                {/* Sound Effects */}
                <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-sm">
                      {sfxEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-stone-400" />
                      )}
                      Hiệu ứng âm thanh (SFX)
                    </span>
                    <button
                      type="button"
                      onClick={toggleSfx}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                        sfxEnabled
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {sfxEnabled ? "BẬT" : "TẮT"}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume( parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Background Music */}
                <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <Music className="w-4 h-4 text-amber-600" />
                      Nhạc ngũ cung dân gian
                    </span>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                        musicEnabled
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {musicEnabled ? "BẬT" : "TẮT"}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Forest Ambient Sounds */}
                <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-sm">
                    <Trees className="w-4 h-4 text-emerald-700" />
                    Âm thanh rừng núi & chim hót
                  </span>
                  <button
                    type="button"
                    onClick={toggleAmbient}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                      ambientEnabled
                        ? "bg-emerald-500 text-white"
                        : "bg-stone-300 text-stone-700"
                    }`}
                  >
                    {ambientEnabled ? "BẬT" : "TẮT"}
                  </button>
                </div>

                {/* Camera Mode & Sensitivity */}
                <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200 space-y-2.5">
                  <span className="flex items-center gap-2 font-bold text-sm">
                    <Camera className="w-4 h-4 text-sky-600" />
                    Góc máy quay bàn cờ
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCameraView("isometric")}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                        cameraView === "isometric"
                          ? "bg-sky-600 text-white border-sky-700 shadow"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      Góc Nghiêng 3D (45°)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraView("topdown")}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                        cameraView === "topdown"
                          ? "bg-sky-600 text-white border-sky-700 shadow"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      Nhìn Từ Trên (Chiến thuật)
                    </button>
                  </div>
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                      <span>Độ nhạy xoay Camera</span>
                      <span>{Math.round((cameraSensitivity / 0.85) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.85}
                      step={0.04}
                      value={cameraSensitivity}
                      onChange={(e) => setCameraSensitivity(parseFloat(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>
                </div>

                {/* Visual Helpers */}
                <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <Eye className="w-4 h-4 text-purple-600" />
                      Gợi ý ô đi hợp lệ
                    </span>
                    <button
                      type="button"
                      onClick={toggleMoveHints}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        showMoveHints
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {showMoveHints ? "HIỆN" : "ẨN"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Hiển thị nhãn bậc linh thú
                    </span>
                    <button
                      type="button"
                      onClick={toggleRankBadges}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        showRankBadges
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {showRankBadges ? "HIỆN" : "ẨN"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="mt-5 w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm shadow transition-colors"
              >
                HOÀN TẤT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIETNAMESE ANIMAL CHESS GUIDE MODAL (HƯỚNG DẪN LUẬT CHƠI) */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/55 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-400 shadow-2xl p-6 sm:p-7 text-stone-800"
            >
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="sticky top-1 float-right w-9 h-9 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-stone-800"
                aria-label="Đóng hướng dẫn"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-amber-950 mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-700" />
                <span>Cẩm Nang Cờ Thú Việt Nam</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mb-4">
                Bàn cờ 7×9 gồm Sông, Bẫy và Đại Bản Doanh (Đình Làng). Mỗi bên điều khiển 8 linh thú đại ngàn Việt Nam.
              </p>

              {/* Key Rules Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 text-xs bg-white/85 p-3.5 rounded-2xl border border-amber-200">
                <div>
                  <strong className="text-red-700">🏆 Điều kiện Chiến Thắng:</strong>
                  <p className="text-stone-600 mt-0.5">
                    Đưa bất kỳ linh thú nào tiến vào Đại Bản Doanh (Đình Làng) của đối phương hoặc thu phục hết linh thú địch.
                  </p>
                </div>
                <div>
                  <strong className="text-sky-700">🌊 Luật Sông & Nhảy Sông:</strong>
                  <p className="text-stone-600 mt-0.5">
                    Chỉ có <strong>Chuột Đồng (Bậc 1)</strong> biết bơi. <strong>Sư Tử (7)</strong> và <strong>Hổ (6)</strong> nhảy vọt qua sông nếu không có Chuột cản đường.
                  </p>
                </div>
                <div>
                  <strong className="text-amber-700">⚡ Khắc Chế Đặc Biệt:</strong>
                  <p className="text-stone-600 mt-0.5">
                    Linh thú bậc cao bắt được bậc thấp hoặc bằng. Riêng <strong>Chuột (1) bắt được Voi (8)</strong> trên cạn, và Voi không thể bắt Chuột!
                  </p>
                </div>
                <div>
                  <strong className="text-emerald-700">🪤 Luật Ô Bẫy:</strong>
                  <p className="text-stone-600 mt-0.5">
                    Quân địch bước vào 3 ô Bẫy quanh Đại Bản Doanh của bạn sẽ bị giảm sức mạnh về <strong>Bậc 0</strong> — bất kỳ quân nào của bạn cũng bắt được!
                  </p>
                </div>
              </div>

              {/* 8 Vietnamese Animals Encyclopedia */}
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-900 mb-2.5">
                Bát Đại Linh Thú Việt Nam (Từ Bậc 8 đến Bậc 1)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ORDERED_ANIMALS.map((type) => {
                  const meta = ANIMAL_METADATA[type];
                  return (
                    <div
                      key={type}
                      className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/90 border border-amber-200 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0 border border-amber-300">
                        {ANIMAL_ICONS[type]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-black text-[10px]">
                            Bậc {meta.rank}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                            {meta.nameVi}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                          {meta.specialAbilityVi}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="mt-5 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow transition-colors"
              >
                ĐÃ HIỂU LUẬT CHƠI
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

