"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Users,
  Globe,
  Sparkles,
  X,
  Play,
  Shield,
  Flame,
  Copy,
  Check,
} from "lucide-react";
import { AIDifficulty, GameMode } from "@/game/gameTypes";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function ModeSelector() {
  const router = useRouter();
  const isOpen = useSettingsStore((s) => s.isModeSelectorOpen);
  const setModeSelectorOpen = useSettingsStore((s) => s.setModeSelectorOpen);

  const gameMode = useGameStore((s) => s.gameMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const startGame = useGameStore((s) => s.startGame);

  const [selectedTab, setSelectedTab] = useState<GameMode>(gameMode);
  const [selectedDiff, setSelectedDiff] = useState<AIDifficulty>(difficulty);
  const [roomCode, setRoomCode] = useState("VN888");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleLaunchGame = () => {
    setGameMode(selectedTab);
    setDifficulty(selectedDiff);
    setModeSelectorOpen(false);

    if (selectedTab === "online") {
      const cleanCode = (roomCode.trim() || "VN888").toUpperCase();
      startGame("online", selectedDiff, cleanCode);
      router.push(`/game/${cleanCode}`);
    } else {
      startGame(selectedTab, selectedDiff);
      router.push("/game");
    }
  };

  const handleCopyRoomLink = () => {
    if (typeof window === "undefined") return;
    const cleanCode = (roomCode.trim() || "VN888").toUpperCase();
    const url = `${window.location.origin}/game/${cleanCode}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-amber-50 via-orange-50/95 to-amber-100 border-4 border-amber-400 shadow-2xl p-6 sm:p-8 text-stone-800"
        >
          <button
            type="button"
            onClick={() => setModeSelectorOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-200/80 hover:bg-amber-300 flex items-center justify-center text-stone-700 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2 border border-emerald-300">
              Chọn Chế Độ Phiêu Lưu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
              Khởi Hành Giữa Đại Ngàn
            </h2>
          </div>

          {/* 3 Mode Tabs */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => setSelectedTab("single")}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 font-bold transition-all ${
                selectedTab === "single"
                  ? "bg-amber-400/90 border-amber-600 text-stone-950 shadow-md scale-[1.02]"
                  : "bg-white/80 border-amber-200 text-stone-600 hover:bg-amber-100/60"
              }`}
            >
              <Bot className="w-6 h-6 text-red-600" />
              <span className="text-xs sm:text-sm font-extrabold">Đấu Với AI</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab("local")}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 font-bold transition-all ${
                selectedTab === "local"
                  ? "bg-amber-400/90 border-amber-600 text-stone-950 shadow-md scale-[1.02]"
                  : "bg-white/80 border-amber-200 text-stone-600 hover:bg-amber-100/60"
              }`}
            >
              <Users className="w-6 h-6 text-emerald-700" />
              <span className="text-xs sm:text-sm font-extrabold">2 Người (Cùng Máy)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab("online")}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 font-bold transition-all ${
                selectedTab === "online"
                  ? "bg-amber-400/90 border-amber-600 text-stone-950 shadow-md scale-[1.02]"
                  : "bg-white/80 border-amber-200 text-stone-600 hover:bg-amber-100/60"
              }`}
            >
              <Globe className="w-6 h-6 text-sky-700" />
              <span className="text-xs sm:text-sm font-extrabold">Phòng Trực Tuyến</span>
            </button>
          </div>

          {/* Mode Configuration Body */}
          {selectedTab === "single" && (
            <div className="space-y-3 bg-white/85 rounded-2xl p-4 border border-amber-200 mb-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Chọn Cấp Độ Trí Tuệ Nhân Tạo (AI):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "easy" as AIDifficulty,
                    label: "Dễ (Tập Sự)",
                    desc: "Đi ngẫu nhiên, phù hợp làm quen luật chơi.",
                    icon: Sparkles,
                    color: "text-emerald-600",
                  },
                  {
                    id: "normal" as AIDifficulty,
                    label: "Vừa (Tinh Anh)",
                    desc: "Biết phối hợp công thủ và bảo vệ hang ổ.",
                    icon: Shield,
                    color: "text-sky-600",
                  },
                  {
                    id: "hard" as AIDifficulty,
                    label: "Khó (Kiện Tướng)",
                    desc: "Chiến thuật sâu sắc, tính trước nhiều bước.",
                    icon: Flame,
                    color: "text-red-600",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = selectedDiff === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDiff(item.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        active
                          ? "bg-amber-100 border-amber-500 shadow-sm"
                          : "bg-stone-50 border-stone-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-sm text-stone-800 mb-1">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === "local" && (
            <div className="bg-white/85 rounded-2xl p-4 border border-amber-200 mb-6 text-sm text-stone-700 space-y-2">
              <p className="font-extrabold text-stone-900">
                Chế độ 2 Kỳ Thủ Trên Cùng Thiết Bị:
              </p>
              <p>
                • <strong className="text-red-600">Đội Hồng Lạc (Đỏ)</strong> đi trước ở phía Nam bàn cờ.
              </p>
              <p>
                • <strong className="text-sky-700">Đội Lam Sơn (Xanh)</strong> ở phía Bắc bàn cờ.
              </p>
              <p>
                • Hai người chơi luân phiên chạm/nhấp vào linh thú của mình để điều binh khiển tướng!
              </p>
            </div>
          )}

          {selectedTab === "online" && (
            <div className="bg-white/85 rounded-2xl p-4 border border-amber-200 mb-6 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Mã Phòng Đại Ngàn (Đồng bộ trực tiếp giữa các tab/kết nối):
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder="VD: VN888"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 font-black text-lg tracking-widest uppercase text-stone-900 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCopyRoomLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs border border-sky-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Đã chép link" : "Chép link phòng"}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600">
                Mở đường dẫn <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">/game/{roomCode || "VN888"}</code> trên 2 cửa sổ trình duyệt để trải nghiệm đồng bộ nước đi thời gian thực!
              </p>
            </div>
          )}

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleLaunchGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg shadow-lg border-2 border-emerald-200 flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>VÀO TRẬN NGAY</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

