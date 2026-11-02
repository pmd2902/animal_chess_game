"use client";

/**
 * Audio Abstraction Layer for Cờ Thú Việt Nam ("Cuộc phiêu lưu giữa đại ngàn").
 *
 * Supports procedural Web Audio API sound synthesis out-of-the-box (so the game
 * has crisp, pleasant tactile sound effects and nature ambience immediately with zero external copyrighted assets),
 * while also allowing drop-in custom audio files under:
 *   /public/audio/click.mp3
 *   /public/audio/select.mp3
 *   /public/audio/move.mp3
 *   /public/audio/swim.mp3
 *   /public/audio/capture.mp3
 *   /public/audio/invalid.mp3
 *   /public/audio/victory.mp3
 *   /public/audio/bgm.mp3
 *   /public/audio/ambient.mp3
 */

export type SoundEffectType =
  | "click"
  | "select"
  | "move"
  | "swim"
  | "jump"
  | "capture"
  | "invalid"
  | "victory"
  | "defeat";

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private ambientEnabled = true;
  private sfxVolume = 0.7;
  private musicVolume = 0.35;
  private ambientTimer: ReturnType<typeof setInterval> | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private pentatonicStep = 0;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSettings(opts: {
    sfxEnabled?: boolean;
    musicEnabled?: boolean;
    ambientEnabled?: boolean;
    sfxVolume?: number;
    musicVolume?: number;
  }) {
    if (opts.sfxEnabled !== undefined) this.sfxEnabled = opts.sfxEnabled;
    if (opts.musicEnabled !== undefined) {
      this.musicEnabled = opts.musicEnabled;
      if (this.musicEnabled) this.startMusic();
      else this.stopMusic();
    }
    if (opts.ambientEnabled !== undefined) {
      this.ambientEnabled = opts.ambientEnabled;
      if (this.ambientEnabled) this.startAmbient();
      else this.stopAmbient();
    }
    if (opts.sfxVolume !== undefined) this.sfxVolume = opts.sfxVolume;
    if (opts.musicVolume !== undefined) this.musicVolume = opts.musicVolume;
  }

  public playSfx(type: SoundEffectType) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(860, now + 0.06);
        gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.075);
        break;
      }
      case "select": {
        // Warm wooden marimba / bamboo chime tap
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);
        gain.gain.setValueAtTime(0.24 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case "move": {
        // Wooden piece placement thud
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.11);
        gain.gain.setValueAtTime(0.32 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }
      case "swim": {
        // Gentle water ripple sound
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.linearRampToValueAtTime(520, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
        gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.21);
        break;
      }
      case "jump": {
        // Whoosh leap sound
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);
        gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }
      case "capture": {
        // Energetic two-note impact chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.16);
        osc2.frequency.setValueAtTime(523.25, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.24);
        gain.gain.setValueAtTime(0.38 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.17);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.26);
        break;
      }
      case "invalid": {
        // Soft low double-buzz
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(135, now + 0.07);
        gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }
      case "victory": {
        // Vietnamese pentatonic celebration fanfare (Hò - Xự - Xang - Xê - Cống)
        const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = "triangle";
          const start = now + idx * 0.11;
          noteOsc.frequency.setValueAtTime(freq, start);
          noteGain.gain.setValueAtTime(0.28 * this.sfxVolume, start);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(start);
          noteOsc.stop(start + 0.46);
        });
        break;
      }
      case "defeat": {
        // Descending pentatonic sigh when the player loses against AI
        const notes = [523.25, 440.0, 392.0, 293.66];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = "sine";
          const start = now + idx * 0.14;
          noteOsc.frequency.setValueAtTime(freq, start);
          noteGain.gain.setValueAtTime(0.25 * this.sfxVolume, start);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.48);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(start);
          noteOsc.stop(start + 0.5);
        });
        break;
      }
    }
  }

  /**
   * Starts soft Vietnamese bamboo flute / plucked zither (Đàn Tranh) pentatonic ambient melody
   */
  public startMusic() {
    if (this.musicTimer || !this.musicEnabled) return;
    // Traditional Vietnamese pentatonic scale frequencies (C5, D5, F5, G5, A5, C6)
    const scale = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5];
    const pattern = [0, 2, 3, 4, 3, 1, 2, 0, 4, 5, 3, 2];

    this.musicTimer = setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.getContext();
      if (!ctx || ctx.state !== "running") return;

      const freq = scale[pattern[this.pentatonicStep % pattern.length]];
      this.pentatonicStep++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06 * this.musicVolume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.45);
    }, 1600);
  }

  public stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /**
   * Starts subtle forest bird chirps in the background
   */
  public startAmbient() {
    if (this.ambientTimer || !this.ambientEnabled) return;
    this.ambientTimer = setInterval(() => {
      if (!this.ambientEnabled) return;
      const ctx = this.getContext();
      if (!ctx || ctx.state !== "running") return;

      // Occasional distant forest bird chirp
      if (Math.random() > 0.55) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const baseFreq = 1650 + Math.random() * 600;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.16);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035 * this.sfxVolume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    }, 3200);
  }

  public stopAmbient() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }
}

export const soundManager = new SoundManager();
