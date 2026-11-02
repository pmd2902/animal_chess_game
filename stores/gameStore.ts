"use client";

import { create } from "zustand";
import {
  ActiveAnimation,
  AIDifficulty,
  GameMode,
  GamePiece,
  GameState,
  Position,
  ValidMove,
} from "@/game/gameTypes";
import { createInitialPieces, isSamePosition } from "@/game/rules";
import {
  executeMove,
  explainInvalidMove,
  getPieceAt,
  getValidMovesForPiece,
} from "@/game/gameEngine";
import { getAnimationDurationMs } from "@/game/animations";
import { chooseAIMove } from "@/game/ai";
import { soundManager } from "@/game/audio";

interface GameStore extends GameState {
  roomCode: string | null;
  playerNames: {
    red: string;
    blue: string;
  };
  startGame: (mode?: GameMode, difficulty?: AIDifficulty, roomCode?: string) => void;
  resetGame: () => void;
  returnToMenu: () => void;
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: AIDifficulty) => void;
  selectPiece: (piece: GamePiece | null) => void;
  handleCellOrPieceClick: (pos: Position) => void;
  executeValidMove: (move: ValidMove) => void;
  undoMove: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  clearInvalidFeedback: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  pieces: createInitialPieces(),
  currentPlayer: "red",
  selectedPiece: null,
  validMoves: [],
  winner: null,
  winReasonVi: null,
  gameMode: "single",
  difficulty: "normal",
  capturedPieces: {
    red: [],
    blue: [],
  },
  moveHistory: [],
  status: "playing",
  isAIThinking: false,
  activeAnimation: null,
  invalidMoveFeedback: null,
  lastMove: null,
  roomCode: null,
  playerNames: {
    red: "Đội Hồng Lạc (Bạn)",
    blue: "Trí Tuệ Đại Ngàn (AI)",
  },

  startGame: (mode, difficulty, roomCode) => {
    const resolvedMode = mode ?? get().gameMode;
    const resolvedDiff = difficulty ?? get().difficulty;
    const diffLabel =
      resolvedDiff === "easy"
        ? "Tập Sự"
        : resolvedDiff === "normal"
        ? "Tinh Anh"
        : "Đại Kiện Tướng";

    soundManager.playSfx("click");
    soundManager.startAmbient();

    set({
      pieces: createInitialPieces(),
      currentPlayer: "red",
      selectedPiece: null,
      validMoves: [],
      winner: null,
      winReasonVi: null,
      gameMode: resolvedMode,
      difficulty: resolvedDiff,
      capturedPieces: { red: [], blue: [] },
      moveHistory: [],
      status: "playing",
      isAIThinking: false,
      activeAnimation: null,
      invalidMoveFeedback: null,
      lastMove: null,
      roomCode: roomCode ?? null,
      playerNames: {
        red: resolvedMode === "single" ? "Đội Hồng Lạc (Bạn)" : "Kỳ Thủ Hồng Lạc (P1)",
        blue:
          resolvedMode === "single"
            ? `Thần Rừng AI (${diffLabel})`
            : resolvedMode === "online"
            ? `Kỳ Thủ Phòng #${roomCode ?? "VN88"}`
            : "Kỳ Thủ Lam Sơn (P2)",
      },
    });
  },

  resetGame: () => {
    const { gameMode, difficulty, roomCode } = get();
    get().startGame(gameMode, difficulty, roomCode ?? undefined);
  },

  returnToMenu: () => {
    soundManager.playSfx("click");
    set({
      status: "menu",
      selectedPiece: null,
      validMoves: [],
      isAIThinking: false,
      activeAnimation: null,
    });
  },

  setGameMode: (mode) => {
    soundManager.playSfx("click");
    set({ gameMode: mode });
  },

  setDifficulty: (difficulty) => {
    soundManager.playSfx("click");
    set({ difficulty });
  },

  selectPiece: (piece) => {
    if (!piece) {
      set({ selectedPiece: null, validMoves: [], invalidMoveFeedback: null });
      return;
    }

    const { pieces, currentPlayer, status, isAIThinking, activeAnimation, gameMode } = get();
    if (status !== "playing" || isAIThinking || activeAnimation) return;
    if (gameMode === "single" && currentPlayer === "blue") return;
    if (piece.player !== currentPlayer) return;

    const moves = getValidMovesForPiece(piece, pieces);
    soundManager.playSfx("select");

    set({
      selectedPiece: piece,
      validMoves: moves,
      invalidMoveFeedback: null,
    });
  },

  handleCellOrPieceClick: (pos) => {
    const state = get();
    if (
      state.status !== "playing" ||
      state.isAIThinking ||
      state.activeAnimation ||
      state.winner
    ) {
      return;
    }

    // In Single Player mode, Blue is controlled by AI
    if (state.gameMode === "single" && state.currentPlayer === "blue") {
      return;
    }

    const clickedPiece = getPieceAt(state.pieces, pos);

    // 1. If we already have a selected piece, check if `pos` is a valid destination
    if (state.selectedPiece) {
      // Clicking the already-selected piece deselects it
      if (isSamePosition(state.selectedPiece.position, pos)) {
        soundManager.playSfx("click");
        set({ selectedPiece: null, validMoves: [], invalidMoveFeedback: null });
        return;
      }

      // Clicking another friendly piece switches selection to it
      if (clickedPiece && clickedPiece.player === state.currentPlayer) {
        get().selectPiece(clickedPiece);
        return;
      }

      // Check if `pos` is in `validMoves`
      const matchedMove = state.validMoves.find((m) => isSamePosition(m.to, pos));
      if (matchedMove) {
        get().executeValidMove(matchedMove);
        return;
      }

      // Otherwise, invalid destination for the selected piece -> shake feedback!
      const reasonVi = explainInvalidMove(state.selectedPiece, pos, state.pieces);
      soundManager.playSfx("invalid");
      set({
        invalidMoveFeedback: {
          pieceId: state.selectedPiece.id,
          targetPosition: pos,
          reasonVi,
          timestamp: Date.now(),
        },
      });
      return;
    }

    // 2. If no piece is selected yet, select friendly piece at `pos`
    if (clickedPiece && clickedPiece.player === state.currentPlayer) {
      get().selectPiece(clickedPiece);
    } else if (clickedPiece && clickedPiece.player !== state.currentPlayer) {
      soundManager.playSfx("invalid");
      set({
        invalidMoveFeedback: {
          pieceId: clickedPiece.id,
          targetPosition: pos,
          reasonVi:
            state.currentPlayer === "red"
              ? "Đang là lượt của Đội Hồng Lạc (Đỏ)!"
              : "Đang là lượt của Đội Lam Sơn (Xanh)!",
          timestamp: Date.now(),
        },
      });
    }
  },

  executeValidMove: (move) => {
    const state = get();
    const movingPiece = getPieceAt(state.pieces, move.from);
    if (!movingPiece) return;

    const capturedPiece = move.targetPieceId
      ? state.pieces.find((p) => p.id === move.targetPieceId)
      : getPieceAt(state.pieces, move.to);

    const duration = getAnimationDurationMs(move.moveType);

    // Play start sound
    if (move.moveType === "jump" || move.moveType === "jump_capture") {
      soundManager.playSfx("jump");
    } else if (move.moveType === "swim") {
      soundManager.playSfx("swim");
    } else {
      soundManager.playSfx("move");
    }

    const anim: ActiveAnimation = {
      id: `anim-${Date.now()}`,
      pieceId: movingPiece.id,
      from: { ...move.from },
      to: { ...move.to },
      moveType: move.moveType,
      capturedPiece,
      startTime: performance.now(),
      duration,
    };

    // Start animation and clear selection indicators immediately
    set({
      selectedPiece: null,
      validMoves: [],
      invalidMoveFeedback: null,
      activeAnimation: anim,
    });

    setTimeout(() => {
      const currentState = get();
      const result = executeMove(currentState.pieces, move);

      if (result.capturedPiece) {
        soundManager.playSfx("capture");
      }

      const nextCaptured = {
        red: [...currentState.capturedPieces.red],
        blue: [...currentState.capturedPieces.blue],
      };

      if (result.capturedPiece) {
        if (result.capturedPiece.player === "red") {
          nextCaptured.red.push(result.capturedPiece);
        } else {
          nextCaptured.blue.push(result.capturedPiece);
        }
      }

      const isVictory = Boolean(result.winner);
      if (isVictory) {
        soundManager.playSfx("victory");
      }

      const shouldTriggerAI =
        !isVictory &&
        currentState.gameMode === "single" &&
        result.nextPlayer === "blue";

      set({
        pieces: result.pieces,
        currentPlayer: result.nextPlayer,
        winner: result.winner,
        winReasonVi: result.winReasonVi,
        status: isVictory ? "victory" : currentState.status,
        capturedPieces: nextCaptured,
        moveHistory: [...currentState.moveHistory, result.moveRecord],
        activeAnimation: null,
        lastMove: { from: move.from, to: move.to },
        isAIThinking: shouldTriggerAI,
      });

      if (shouldTriggerAI) {
        // Non-blocking AI thinking delay so player sees "AI đang suy nghĩ..."
        const thinkTime = 620 + Math.floor(Math.random() * 380);
        setTimeout(() => {
          const latest = get();
          if (
            latest.status !== "playing" ||
            latest.winner ||
            latest.currentPlayer !== "blue"
          ) {
            set({ isAIThinking: false });
            return;
          }

          const aiMove = chooseAIMove(latest.pieces, "blue", latest.difficulty);
          set({ isAIThinking: false });
          if (aiMove) {
            get().executeValidMove(aiMove);
          }
        }, thinkTime);
      }
    }, duration);
  },

  undoMove: () => {
    const state = get();
    if (state.isAIThinking || state.activeAnimation || state.moveHistory.length === 0) {
      return;
    }

    soundManager.playSfx("click");

    // In Single Player mode, undo both the AI's last move and the player's last move if it's currently Red's turn
    const stepsToUndo =
      state.gameMode === "single" &&
      state.currentPlayer === "red" &&
      state.moveHistory.length >= 2
        ? 2
        : 1;

    const targetIndex = Math.max(0, state.moveHistory.length - stepsToUndo);
    const targetRecord = state.moveHistory[targetIndex];
    const remainingHistory = state.moveHistory.slice(0, targetIndex);

    // Recompute captured pieces from remaining history
    const restoredCaptured = { red: [] as GamePiece[], blue: [] as GamePiece[] };
    for (const rec of remainingHistory) {
      if (rec.capturedPiece) {
        if (rec.capturedPiece.player === "red") {
          restoredCaptured.red.push(rec.capturedPiece);
        } else {
          restoredCaptured.blue.push(rec.capturedPiece);
        }
      }
    }

    const lastRec = remainingHistory[remainingHistory.length - 1];

    set({
      pieces: targetRecord.boardSnapshot.map((p) => ({
        ...p,
        position: { ...p.position },
      })),
      currentPlayer: targetRecord.player,
      selectedPiece: null,
      validMoves: [],
      winner: null,
      winReasonVi: null,
      status: "playing",
      capturedPieces: restoredCaptured,
      moveHistory: remainingHistory,
      lastMove: lastRec ? { from: lastRec.from, to: lastRec.to } : null,
      invalidMoveFeedback: null,
    });
  },

  pauseGame: () => {
    soundManager.playSfx("click");
    set((state) => ({
      status: state.status === "playing" ? "paused" : state.status,
    }));
  },

  resumeGame: () => {
    soundManager.playSfx("click");
    set((state) => ({
      status: state.status === "paused" ? "playing" : state.status,
    }));
  },

  clearInvalidFeedback: () => {
    set({ invalidMoveFeedback: null });
  },
}));

