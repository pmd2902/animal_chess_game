"use client";

import { create } from "zustand";
import { CameraViewMode } from "@/game/gameTypes";
import { soundManager } from "@/game/audio";

interface SettingsState {
  cameraView: CameraViewMode;
  cameraZoom: number; // 0.75 to 1.35
  cameraSensitivity: number; // 0.1 to 0.8 (default 0.32 for smooth, gentle rotation)
  cameraResetTrigger: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  ambientEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  showMoveHints: boolean;
  showRankBadges: boolean;
  isSettingsOpen: boolean;
  isGuideOpen: boolean;
  isModeSelectorOpen: boolean;

  toggleCameraView: () => void;
  setCameraView: (view: CameraViewMode) => void;
  setCameraSensitivity: (sens: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;
  toggleSfx: () => void;
  toggleMusic: () => void;
  toggleAmbient: () => void;
  setSfxVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  toggleMoveHints: () => void;
  toggleRankBadges: () => void;
  setSettingsOpen: (open: boolean) => void;
  setGuideOpen: (open: boolean) => void;
  setModeSelectorOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  cameraView: "isometric",
  cameraZoom: 1.0,
  cameraSensitivity: 0.32,
  cameraResetTrigger: 0,
  sfxEnabled: true,
  musicEnabled: false,
  ambientEnabled: true,
  sfxVolume: 0.75,
  musicVolume: 0.35,
  showMoveHints: true,
  showRankBadges: true,
  isSettingsOpen: false,
  isGuideOpen: false,
  isModeSelectorOpen: false,

  toggleCameraView: () => {
    soundManager.playSfx("click");
    set((state) => ({
      cameraView: state.cameraView === "isometric" ? "topdown" : "isometric",
    }));
  },

  setCameraView: (view) => {
    soundManager.playSfx("click");
    set({ cameraView: view });
  },

  setCameraSensitivity: (sens) => {
    set({ cameraSensitivity: Math.max(0.1, Math.min(0.85, sens)) });
  },

  zoomIn: () => {
    soundManager.playSfx("click");
    set((state) => ({
      cameraZoom: Math.max(0.7, Number((state.cameraZoom - 0.12).toFixed(2))),
    }));
  },

  zoomOut: () => {
    soundManager.playSfx("click");
    set((state) => ({
      cameraZoom: Math.min(1.4, Number((state.cameraZoom + 0.12).toFixed(2))),
    }));
  },

  resetCamera: () => {
    soundManager.playSfx("click");
    set((state) => ({
      cameraZoom: 1.0,
      cameraResetTrigger: state.cameraResetTrigger + 1,
    }));
  },

  toggleSfx: () => {
    const next = !get().sfxEnabled;
    soundManager.setSettings({ sfxEnabled: next });
    if (next) soundManager.playSfx("click");
    set({ sfxEnabled: next });
  },

  toggleMusic: () => {
    const next = !get().musicEnabled;
    soundManager.setSettings({ musicEnabled: next });
    soundManager.playSfx("click");
    set({ musicEnabled: next });
  },

  toggleAmbient: () => {
    const next = !get().ambientEnabled;
    soundManager.setSettings({ ambientEnabled: next });
    soundManager.playSfx("click");
    set({ ambientEnabled: next });
  },

  setSfxVolume: (vol) => {
    soundManager.setSettings({ sfxVolume: vol });
    set({ sfxVolume: vol });
  },

  setMusicVolume: (vol) => {
    soundManager.setSettings({ musicVolume: vol });
    set({ musicVolume: vol });
  },

  toggleMoveHints: () => {
    soundManager.playSfx("click");
    set((state) => ({ showMoveHints: !state.showMoveHints }));
  },

  toggleRankBadges: () => {
    soundManager.playSfx("click");
    set((state) => ({ showRankBadges: !state.showRankBadges }));
  },

  setSettingsOpen: (open) => {
    soundManager.playSfx("click");
    set({ isSettingsOpen: open });
  },

  setGuideOpen: (open) => {
    soundManager.playSfx("click");
    set({ isGuideOpen: open });
  },

  setModeSelectorOpen: (open) => {
    soundManager.playSfx("click");
    set({ isModeSelectorOpen: open });
  },
}));
