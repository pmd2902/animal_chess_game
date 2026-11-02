import { MoveType, Position } from "./gameTypes";

export const CELL_SIZE = 1.25;
export const BOARD_WIDTH = 7 * CELL_SIZE;
export const BOARD_HEIGHT = 9 * CELL_SIZE;

/**
 * Converts a logical board position (row 0..8, col 0..6) into 3D world coordinates [x, y, z].
 * Center of the board (row 4, col 3) is at [0, 0, 0].
 */
export function boardToWorldPosition(pos: Position, yOffset = 0.22): [number, number, number] {
  const x = (pos.col - 3) * CELL_SIZE;
  const z = (pos.row - 4) * CELL_SIZE;
  return [x, yOffset, z];
}

export function getAnimationDurationMs(moveType: MoveType): number {
  switch (moveType) {
    case "jump":
    case "jump_capture":
      return 620;
    case "capture":
      return 500;
    case "swim":
      return 420;
    case "normal":
    default:
      return 380;
  }
}

export function getJumpArcHeight(moveType: MoveType): number {
  switch (moveType) {
    case "jump":
    case "jump_capture":
      return 1.65;
    case "capture":
      return 0.75;
    case "swim":
      return 0.18;
    case "normal":
    default:
      return 0.42;
  }
}

/**
 * Shortest-path angular interpolation in radians (prevents 270-degree backward spins
 * when interpolating between -PI/2 and +PI).
 */
export function lerpAngle(fromAngle: number, toAngle: number, t: number): number {
  const twoPi = Math.PI * 2;
  const delta = ((((toAngle - fromAngle) % twoPi) + Math.PI * 3) % twoPi) - Math.PI;
  return fromAngle + delta * t;
}

/**
 * Responsive horizontal easing: starts moving immediately on frame 1 (no cubic dead-zone pause
 * at t = 0) and decelerates smoothly into the target cell.
 */
export function easeResponsiveMove(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const smooth = clamped * clamped * (3 - 2 * clamped);
  // Blend 35% linear takeoff with 65% smoothstep so initial velocity > 0 at t = 0
  return 0.35 * clamped + 0.65 * smooth;
}

/**
 * Smooth step function (C1 continuous derivative at endpoints)
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Calculates the 3D position, scale, and smooth shortest-path rotation of a moving piece
 * at normalized progress `t` (0..1).
 */
export function interpolateMoveTransform(
  from: Position,
  to: Position,
  moveType: MoveType,
  t: number,
  baseYOffset = 0.22,
  defaultYaw = 0,
  takeoffYBonus = 0,
  takeoffScaleBonus = 0
): {
  position: [number, number, number];
  scaleMultiplier: number;
  pitchAngle: number;
  yawAngle: number;
} {
  const [startX, startY, startZ] = boardToWorldPosition(from, baseYOffset);
  const [endX, endY, endZ] = boardToWorldPosition(to, baseYOffset);

  const clampedT = Math.max(0, Math.min(1, t));
  const horizT = easeResponsiveMove(clampedT);

  const x = startX + (endX - startX) * horizT;
  const z = startZ + (endZ - startZ) * horizT;

  const arcHeight = getJumpArcHeight(moveType);
  // Natural projectile vertical arc driven by clampedT (immediate upward velocity at t = 0)
  // plus seamless decay of any selection-bounce elevation the piece already had at takeoff!
  const arcY = Math.sin(clampedT * Math.PI) * arcHeight;
  const carryOverY = takeoffYBonus * (1 - smoothstep(0, 0.45, clampedT));
  const y = startY + (endY - startY) * horizT + arcY + carryOverY;

  // Seamless scale from selection scale (e.g. 1.12) into mid-air hop and down to 1.0 on landing
  const carryOverScale = takeoffScaleBonus * (1 - smoothstep(0, 0.5, clampedT));
  const scaleMultiplier = 1 + Math.sin(clampedT * Math.PI) * 0.06 + carryOverScale;

  // Compute movement heading angle
  const dx = endX - startX;
  const dz = endZ - startZ;
  const moveHeadingYaw = Math.atan2(dx, dz);

  // Smoothly turn from defaultYaw toward moveHeadingYaw at the start of the step,
  // and smoothly align back toward defaultYaw as the piece lands (t > 0.68),
  // ALWAYS using shortest angular path (`lerpAngle`) so it never spins backward!
  const turnIn = smoothstep(0.0, 0.2, clampedT);
  const turnOut = smoothstep(0.68, 1.0, clampedT);
  const yawDuringMove = lerpAngle(defaultYaw, moveHeadingYaw, turnIn);
  const yawAngle = lerpAngle(yawDuringMove, defaultYaw, turnOut);

  // Gentle forward lean during the hop
  const pitchAngle =
    Math.sin(clampedT * Math.PI) * (moveType.includes("jump") ? 0.24 : 0.1);

  return {
    position: [x, y, z],
    scaleMultiplier,
    pitchAngle,
    yawAngle,
  };
}
