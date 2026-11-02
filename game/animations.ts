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
      return 680;
    case "capture":
      return 580;
    case "swim":
      return 480;
    case "normal":
    default:
      return 420;
  }
}

export function getJumpArcHeight(moveType: MoveType): number {
  switch (moveType) {
    case "jump":
    case "jump_capture":
      return 1.85;
    case "capture":
      return 0.95;
    case "swim":
      return 0.28;
    case "normal":
    default:
      return 0.55;
  }
}

/**
 * Smooth ease-in-out cubic function for piece movement interpolation
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Calculates the 3D position and scale of a moving piece at normalized progress `t` (0..1).
 */
export function interpolateMoveTransform(
  from: Position,
  to: Position,
  moveType: MoveType,
  t: number,
  baseYOffset = 0.22
): {
  position: [number, number, number];
  scaleMultiplier: number;
  pitchAngle: number;
  targetYaw: number;
} {
  const [startX, startY, startZ] = boardToWorldPosition(from, baseYOffset);
  const [endX, endY, endZ] = boardToWorldPosition(to, baseYOffset);

  const clampedT = Math.max(0, Math.min(1, t));
  const easedT = easeInOutCubic(clampedT);

  const x = startX + (endX - startX) * easedT;
  const z = startZ + (endZ - startZ) * easedT;

  const arcHeight = getJumpArcHeight(moveType);
  // Parabolic arc sin(pi * t)
  const arcY = Math.sin(clampedT * Math.PI) * arcHeight;

  // Landing bounce at the very end (t > 0.85)
  let bounceY = 0;
  let scaleMultiplier = 1;
  if (clampedT < 0.15) {
    // Anticipation squat & stretch
    scaleMultiplier = 1 + Math.sin((clampedT / 0.15) * Math.PI) * 0.12;
  } else if (clampedT > 0.85) {
    const landT = (clampedT - 0.85) / 0.15;
    bounceY = Math.sin(landT * Math.PI) * 0.12;
    scaleMultiplier = 1 - Math.sin(landT * Math.PI) * 0.08;
  }

  const y = startY + (endY - startY) * easedT + arcY + bounceY;

  // Compute rotation toward destination
  const dx = endX - startX;
  const dz = endZ - startZ;
  const targetYaw = Math.atan2(dx, dz);

  // Subtle forward pitch while jumping/lunging
  const pitchAngle = Math.sin(clampedT * Math.PI * 2) * (moveType.includes("jump") ? 0.35 : 0.18);

  return {
    position: [x, y, z],
    scaleMultiplier,
    pitchAngle,
    targetYaw,
  };
}

