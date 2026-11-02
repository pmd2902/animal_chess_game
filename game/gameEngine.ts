import {
  ANIMAL_METADATA,
  canCapturePiece,
  isOpponentDen,
  isOwnDen,
  isRiverCell,
  isSamePosition,
  isWithinBounds,
} from "./rules";
import {
  GamePiece,
  MoveRecord,
  Player,
  Position,
  ValidMove,
} from "./gameTypes";

export function getPieceAt(pieces: GamePiece[], pos: Position): GamePiece | undefined {
  return pieces.find((p) => p.position.row === pos.row && p.position.col === pos.col);
}

/**
 * Computes all valid moves for a single piece given the current board pieces.
 */
export function getValidMovesForPiece(piece: GamePiece, pieces: GamePiece[]): ValidMove[] {
  const validMoves: ValidMove[] = [];
  const meta = ANIMAL_METADATA[piece.type];
  const directions = [
    { dRow: -1, dCol: 0 }, // Up
    { dRow: 1, dCol: 0 },  // Down
    { dRow: 0, dCol: -1 }, // Left
    { dRow: 0, dCol: 1 },  // Right
  ];

  for (const { dRow, dCol } of directions) {
    const nextPos: Position = {
      row: piece.position.row + dRow,
      col: piece.position.col + dCol,
    };

    if (!isWithinBounds(nextPos)) continue;
    if (isOwnDen(nextPos, piece.player)) continue;

    const nextIsRiver = isRiverCell(nextPos);

    // Case 1: Next cell is a river cell
    if (nextIsRiver) {
      // Case 1a: Animal can swim (Mouse)
      if (meta.canSwim) {
        const occupant = getPieceAt(pieces, nextPos);
        if (!occupant) {
          validMoves.push({
            from: piece.position,
            to: nextPos,
            moveType: "swim",
          });
        } else if (canCapturePiece(piece, occupant)) {
          validMoves.push({
            from: piece.position,
            to: nextPos,
            moveType: "capture",
            targetPieceId: occupant.id,
          });
        }
        continue;
      }

      // Case 1b: Animal can jump river (Lion & Tiger)
      if (meta.canJumpRiver) {
        let jumpPos: Position = { ...nextPos };
        let blockedByMouseInRiver = false;

        while (isWithinBounds(jumpPos) && isRiverCell(jumpPos)) {
          const riverOccupant = getPieceAt(pieces, jumpPos);
          if (riverOccupant) {
            blockedByMouseInRiver = true;
            break;
          }
          jumpPos = {
            row: jumpPos.row + dRow,
            col: jumpPos.col + dCol,
          };
        }

        if (!blockedByMouseInRiver && isWithinBounds(jumpPos) && !isOwnDen(jumpPos, piece.player)) {
          const landingOccupant = getPieceAt(pieces, jumpPos);
          if (!landingOccupant) {
            validMoves.push({
              from: piece.position,
              to: jumpPos,
              moveType: "jump",
            });
          } else {
            // Check if attacker from land can capture defender on landing square
            const virtualAttacker: GamePiece = {
              ...piece,
              position: piece.position, // Attacker is on land
            };
            if (canCapturePiece(virtualAttacker, landingOccupant)) {
              validMoves.push({
                from: piece.position,
                to: jumpPos,
                moveType: "jump_capture",
                targetPieceId: landingOccupant.id,
              });
            }
          }
        }
      }

      continue;
    }

    // Case 2: Next cell is land (including traps and opponent den)
    const occupant = getPieceAt(pieces, nextPos);
    if (!occupant) {
      validMoves.push({
        from: piece.position,
        to: nextPos,
        moveType: "normal",
      });
    } else if (canCapturePiece(piece, occupant)) {
      validMoves.push({
        from: piece.position,
        to: nextPos,
        moveType: "capture",
        targetPieceId: occupant.id,
      });
    }
  }

  return validMoves;
}

export function getAllValidMovesForPlayer(player: Player, pieces: GamePiece[]): ValidMove[] {
  const playerPieces = pieces.filter((p) => p.player === player);
  const allMoves: ValidMove[] = [];
  for (const piece of playerPieces) {
    allMoves.push(...getValidMovesForPiece(piece, pieces));
  }
  return allMoves;
}

/**
 * Provides a user-friendly Vietnamese explanation for why a clicked move is invalid.
 */
export function explainInvalidMove(
  piece: GamePiece,
  targetPos: Position,
  pieces: GamePiece[]
): string {
  if (isSamePosition(piece.position, targetPos)) {
    return "Đã bỏ chọn quân cờ.";
  }
  if (isOwnDen(targetPos, piece.player)) {
    return "Không được đi vào hang ổ của chính mình!";
  }

  const meta = ANIMAL_METADATA[piece.type];
  const targetIsRiver = isRiverCell(targetPos);

  if (targetIsRiver && !meta.canSwim) {
    return `${piece.nameVi} không biết bơi! Chỉ có Chuột Đồng mới xuống sông được.`;
  }

  const occupant = getPieceAt(pieces, targetPos);
  if (occupant && occupant.player === piece.player) {
    return "Ô này đã có đồng đội đứng!";
  }

  const dist =
    Math.abs(piece.position.row - targetPos.row) +
    Math.abs(piece.position.col - targetPos.col);

  if (dist > 1 && meta.canJumpRiver) {
    // Check if river jump was blocked by a mouse
    if (piece.position.row === targetPos.row || piece.position.col === targetPos.col) {
      return `${piece.nameVi} chỉ nhảy qua sông được khi không có Chuột chặn đường và điểm đáp hợp lệ!`;
    }
  }

  if (occupant && occupant.player !== piece.player) {
    if (isRiverCell(piece.position) !== isRiverCell(occupant.position)) {
      return "Không thể tấn công giữa dưới sông và trên bờ!";
    }
    if (piece.type === "elephant" && occupant.type === "mouse") {
      return "Voi Bản Đôn không thể bắt Chuột Đồng!";
    }
    if (piece.rank < occupant.rank) {
      return `${piece.nameVi} (Bậc ${piece.rank}) không thể bắt ${occupant.nameVi} (Bậc ${occupant.rank})!`;
    }
  }

  return `${piece.nameVi} chỉ được đi 1 ô ngang hoặc dọc mỗi lượt!`;
}

export interface MoveExecutionResult {
  pieces: GamePiece[];
  capturedPiece?: GamePiece;
  moveRecord: MoveRecord;
  winner: Player | null;
  winReasonVi: string | null;
  nextPlayer: Player;
}

export function executeMove(
  pieces: GamePiece[],
  validMove: ValidMove
): MoveExecutionResult {
  const movingPiece = getPieceAt(pieces, validMove.from);
  if (!movingPiece) {
    throw new Error("Moving piece not found at source position");
  }

  const boardSnapshot = pieces.map((p) => ({
    ...p,
    position: { ...p.position },
  }));

  const capturedPiece = validMove.targetPieceId
    ? pieces.find((p) => p.id === validMove.targetPieceId)
    : getPieceAt(pieces, validMove.to);

  const updatedPieces = pieces
    .filter((p) => p.id !== capturedPiece?.id)
    .map((p) =>
      p.id === movingPiece.id
        ? { ...p, position: { ...validMove.to } }
        : { ...p, position: { ...p.position } }
    );

  const moveRecord: MoveRecord = {
    pieceId: movingPiece.id,
    pieceType: movingPiece.type,
    player: movingPiece.player,
    from: { ...validMove.from },
    to: { ...validMove.to },
    moveType: validMove.moveType,
    capturedPiece: capturedPiece ? { ...capturedPiece, position: { ...capturedPiece.position } } : undefined,
    timestamp: Date.now(),
    boardSnapshot,
  };

  const nextPlayer: Player = movingPiece.player === "red" ? "blue" : "red";
  const winCheck = checkWinCondition(updatedPieces, movingPiece, validMove.to, nextPlayer);

  return {
    pieces: updatedPieces,
    capturedPiece,
    moveRecord,
    winner: winCheck.winner,
    winReasonVi: winCheck.winReasonVi,
    nextPlayer,
  };
}

export function checkWinCondition(
  pieces: GamePiece[],
  lastMovedPiece: GamePiece,
  destination: Position,
  nextPlayer: Player
): { winner: Player | null; winReasonVi: string | null } {
  // 1. Entered opponent's Den
  if (isOpponentDen(destination, lastMovedPiece.player)) {
    const teamName = lastMovedPiece.player === "red" ? "Đội Hồng Lạc" : "Đội Lam Sơn";
    return {
      winner: lastMovedPiece.player,
      winReasonVi: `${lastMovedPiece.nameVi} của ${teamName} đã tiến vào Đại Bản Doanh đối phương!`,
    };
  }

  // 2. Eliminated all opponent pieces
  const opponentPieces = pieces.filter((p) => p.player === nextPlayer);
  if (opponentPieces.length === 0) {
    const teamName = lastMovedPiece.player === "red" ? "Đội Hồng Lạc" : "Đội Lam Sơn";
    return {
      winner: lastMovedPiece.player,
      winReasonVi: `${teamName} đã thu phục toàn bộ linh thú của đối phương!`,
    };
  }

  // 3. Opponent has no valid moves left
  const opponentMoves = getAllValidMovesForPlayer(nextPlayer, pieces);
  if (opponentMoves.length === 0) {
    const teamName = lastMovedPiece.player === "red" ? "Đội Hồng Lạc" : "Đội Lam Sơn";
    return {
      winner: lastMovedPiece.player,
      winReasonVi: `Đối phương hết nước đi hợp lệ — ${teamName} giành chiến thắng!`,
    };
  }

  return { winner: null, winReasonVi: null };
}

