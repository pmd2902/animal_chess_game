import { executeMove, getAllValidMovesForPlayer } from "./gameEngine";
import { AIDifficulty, GamePiece, Player, Position, ValidMove } from "./gameTypes";
import { isInOpponentTrap, isOpponentDen, isRiverCell } from "./rules";

const PIECE_VALUES: Record<string, number> = {
  elephant: 880,
  lion: 740,
  tiger: 640,
  leopard: 460,
  wolf: 360,
  dog: 270,
  cat: 200,
  mouse: 390, // High strategic value because it can capture Elephant and swim
};

function getTargetDen(player: Player): Position {
  return player === "red" ? { row: 0, col: 3 } : { row: 8, col: 3 };
}

function getOwnDen(player: Player): Position {
  return player === "red" ? { row: 8, col: 3 } : { row: 0, col: 3 };
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Heuristic evaluation of the board from the perspective of `aiPlayer`.
 */
export function evaluateBoard(pieces: GamePiece[], aiPlayer: Player): number {
  const humanPlayer: Player = aiPlayer === "blue" ? "red" : "blue";
  let score = 0;

  const aiTargetDen = getTargetDen(aiPlayer);
  const humanTargetDen = getTargetDen(humanPlayer);
  const aiOwnDen = getOwnDen(aiPlayer);

  for (const piece of pieces) {
    const baseVal = PIECE_VALUES[piece.type] ?? piece.rank * 100;
    const isAI = piece.player === aiPlayer;
    const targetDen = isAI ? aiTargetDen : humanTargetDen;
    const distToEnemyDen = manhattanDistance(piece.position, targetDen);

    // Bonus for advancing toward enemy den
    const advancementBonus = Math.max(0, (12 - distToEnemyDen) * 16);

    // Bonus if piece is on opponent trap (one step from winning!)
    const nearEnemyDenBonus =
      distToEnemyDen === 1 ? 260 : distToEnemyDen === 2 ? 95 : 0;

    // Bonus for defending own den when Dog/Cat/Wolf is nearby
    const distToOwnDen = manhattanDistance(piece.position, isAI ? aiOwnDen : aiTargetDen);
    const defenseBonus =
      (piece.type === "dog" || piece.type === "cat") && distToOwnDen <= 2 ? 40 : 0;

    // River control bonus for Mouse
    const riverBonus = piece.type === "mouse" && isRiverCell(piece.position) ? 35 : 0;

    const totalPieceScore =
      baseVal + advancementBonus + nearEnemyDenBonus + defenseBonus + riverBonus;

    if (isAI) {
      score += totalPieceScore;
    } else {
      score -= totalPieceScore;
    }
  }

  return score;
}

/**
 * Minimax with Alpha-Beta Pruning for Hard AI
 */
function minimax(
  pieces: GamePiece[],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiPlayer: Player
): number {
  const currentTurn: Player = maximizingPlayer
    ? aiPlayer
    : aiPlayer === "blue"
    ? "red"
    : "blue";

  const moves = getAllValidMovesForPlayer(currentTurn, pieces);
  if (depth === 0 || moves.length === 0) {
    return evaluateBoard(pieces, aiPlayer);
  }

  // Order moves so captures and den entries are searched first (improves pruning!)
  moves.sort((a, b) => {
    const aPriority = (a.targetPieceId ? 50 : 0) + (isOpponentDen(a.to, currentTurn) ? 500 : 0);
    const bPriority = (b.targetPieceId ? 50 : 0) + (isOpponentDen(b.to, currentTurn) ? 500 : 0);
    return bPriority - aPriority;
  });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const result = executeMove(pieces, move);
      if (result.winner === aiPlayer) {
        return 100000 + depth * 1000;
      }
      const evaluation = minimax(result.pieces, depth - 1, alpha, beta, false, aiPlayer);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const result = executeMove(pieces, move);
      if (result.winner && result.winner !== aiPlayer) {
        return -100000 - depth * 1000;
      }
      const evaluation = minimax(result.pieces, depth - 1, alpha, beta, true, aiPlayer);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function chooseAIMove(
  pieces: GamePiece[],
  aiPlayer: Player,
  difficulty: AIDifficulty
): ValidMove | null {
  const allMoves = getAllValidMovesForPlayer(aiPlayer, pieces);
  if (allMoves.length === 0) return null;

  // Immediate winning move check across all difficulties
  for (const move of allMoves) {
    if (isOpponentDen(move.to, aiPlayer)) {
      return move;
    }
  }

  // EASY: Random legal move with basic capture preference
  if (difficulty === "easy") {
    const captureMoves = allMoves.filter((m) => Boolean(m.targetPieceId));
    if (captureMoves.length > 0 && Math.random() < 0.65) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // NORMAL: 1-ply + threat evaluation with slight randomness
  if (difficulty === "normal") {
    let bestMove = allMoves[0];
    let bestScore = -Infinity;

    for (const move of allMoves) {
      const result = executeMove(pieces, move);
      if (result.winner === aiPlayer) return move;

      let score = evaluateBoard(result.pieces, aiPlayer);

      // Penalize moving into a square where an enemy piece can immediately capture us
      const enemyPlayer: Player = aiPlayer === "blue" ? "red" : "blue";
      const enemyReplies = getAllValidMovesForPlayer(enemyPlayer, result.pieces);
      for (const reply of enemyReplies) {
        if (reply.to.row === move.to.row && reply.to.col === move.to.col) {
          score -= 320;
        }
        if (isOpponentDen(reply.to, enemyPlayer)) {
          score -= 5000;
        }
      }

      // Add small jitter so Normal AI feels natural and varied
      score += (Math.random() - 0.5) * 35;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // HARD: 3-ply Alpha-Beta Search
  let bestMove = allMoves[0];
  let bestScore = -Infinity;

  // Sort top-level moves for better alpha-beta cutoffs
  const sortedMoves = [...allMoves].sort((a, b) => {
    const aScore = (a.targetPieceId ? 100 : 0) + (isInOpponentTrap(a.to, aiPlayer === "blue" ? "red" : "blue") ? 50 : 0);
    const bScore = (b.targetPieceId ? 100 : 0) + (isInOpponentTrap(b.to, aiPlayer === "blue" ? "red" : "blue") ? 50 : 0);
    return bScore - aScore;
  });

  for (const move of sortedMoves) {
    const result = executeMove(pieces, move);
    if (result.winner === aiPlayer) return move;

    const score = minimax(result.pieces, 2, -Infinity, Infinity, false, aiPlayer);
    // Tiny tie-breaker jitter
    const adjustedScore = score + (Math.random() - 0.5) * 8;

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }
  }

  return bestMove;
}

