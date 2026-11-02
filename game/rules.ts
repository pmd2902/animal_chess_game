import { AnimalType, CellType, GamePiece, Player, Position } from "./gameTypes";

export const BOARD_ROWS = 9;
export const BOARD_COLS = 7;

export interface AnimalMetadata {
  type: AnimalType;
  rank: number;
  nameVi: string;
  titleVi: string;
  descriptionVi: string;
  specialAbilityVi: string;
  canSwim: boolean;
  canJumpRiver: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  scale: number;
}

export const ANIMAL_METADATA: Record<AnimalType, AnimalMetadata> = {
  elephant: {
    type: "elephant",
    rank: 8,
    nameVi: "Voi Bản Đôn",
    titleVi: "Thần Tượng Đại Ngàn",
    descriptionVi: "Chúa tể sức mạnh vùng Tây Nguyên với tấm thảm thổ cẩm rực rỡ.",
    specialAbilityVi: "Mạnh nhất bàn cờ (Bậc 8), nhưng không thể bắt Chuột và có thể bị Chuột trên cạn hạ gục.",
    canSwim: false,
    canJumpRiver: false,
    primaryColor: "#8A9A86",
    secondaryColor: "#D4A373",
    accentColor: "#E63946",
    scale: 1.22,
  },
  lion: {
    type: "lion",
    rank: 7,
    nameVi: "Sư Tử Sơn Lâm",
    titleVi: "Nghê Thần Hộ Pháp",
    descriptionVi: "Linh thú bờm vàng lấy cảm hứng từ hình tượng Nghê Việt cổ kính.",
    specialAbilityVi: "Bậc 7. Có thể nhảy vọt qua sông theo chiều ngang hoặc dọc nếu không có Chuột cản đường.",
    canSwim: false,
    canJumpRiver: true,
    primaryColor: "#F4A261",
    secondaryColor: "#B5651D",
    accentColor: "#FFD166",
    scale: 1.15,
  },
  tiger: {
    type: "tiger",
    rank: 6,
    nameVi: "Hổ Đông Dương",
    titleVi: "Chúa Sơn Lâm",
    descriptionVi: "Oai phong lẫm liệt với bộ lông cam vằn đen mềm mại và chiếc khăn rằn.",
    specialAbilityVi: "Bậc 6. Có thể nhảy qua sông ngang hoặc dọc khi mặt nước không có Chuột chặn.",
    canSwim: false,
    canJumpRiver: true,
    primaryColor: "#FB8500",
    secondaryColor: "#2B2D42",
    accentColor: "#FFB703",
    scale: 1.1,
  },
  leopard: {
    type: "leopard",
    rank: 5,
    nameVi: "Báo Hoa Mai",
    titleVi: "Cơn Gió Rừng Già",
    descriptionVi: "Nhanh nhẹn, tinh anh với những đốm hoa mai vàng óng.",
    specialAbilityVi: "Bậc 5. Di chuyển linh hoạt trên đất liền, công thủ toàn diện.",
    canSwim: false,
    canJumpRiver: false,
    primaryColor: "#E9C46A",
    secondaryColor: "#6C584C",
    accentColor: "#2A9D8F",
    scale: 1.0,
  },
  wolf: {
    type: "wolf",
    rank: 4,
    nameVi: "Sói Rừng Trường Sơn",
    titleVi: "Thợ Săn Tinh Nhuệ",
    descriptionVi: "Đôi tai dựng đứng và ánh mắt thông minh của loài sói núi rừng.",
    specialAbilityVi: "Bậc 4. Giữ thế trận trung tuyến vững chắc.",
    canSwim: false,
    canJumpRiver: false,
    primaryColor: "#778DA9",
    secondaryColor: "#E0E1DD",
    accentColor: "#415A77",
    scale: 0.96,
  },
  dog: {
    type: "dog",
    rank: 3,
    nameVi: "Chó Phú Quốc",
    titleVi: "Khuyển Thần Xoáy Lưng",
    descriptionVi: "Chú chó Phú Quốc trung thành với vòng cổ lục lạc vàng đáng yêu.",
    specialAbilityVi: "Bậc 3. Bảo vệ hang ổ và bẫy cực kỳ hiệu quả.",
    canSwim: false,
    canJumpRiver: false,
    primaryColor: "#C68B59",
    secondaryColor: "#FFF3B0",
    accentColor: "#E09F3E",
    scale: 0.9,
  },
  cat: {
    type: "cat",
    rank: 2,
    nameVi: "Mèo Mướp Làng Quê",
    titleVi: "Tiểu Hổ Đồng Bằng",
    descriptionVi: "Chú mèo mướp đội nón lá nhỏ xinh, chuyên gia săn chuột.",
    specialAbilityVi: "Bậc 2. Khắc tinh số một của Chuột Đồng để bảo vệ Voi.",
    canSwim: false,
    canJumpRiver: false,
    primaryColor: "#F2CC8F",
    secondaryColor: "#E07A5F",
    accentColor: "#81B29A",
    scale: 0.85,
  },
  mouse: {
    type: "mouse",
    rank: 1,
    nameVi: "Chuột Đồng Lúa Chín",
    titleVi: "Kỵ Sĩ Sông Nước",
    descriptionVi: "Nhỏ nhắn với đôi tai tròn to, tinh nghịch và gan dạ.",
    specialAbilityVi: "Bậc 1. Duy nhất biết bơi dưới sông, chặn đường nhảy của Hổ/Sư Tử và bắt được Voi!",
    canSwim: true,
    canJumpRiver: false,
    primaryColor: "#E5989B",
    secondaryColor: "#FFCDB2",
    accentColor: "#B5838D",
    scale: 0.76,
  },
};

/**
 * Standard 7x9 Dou Shou Qi / Cờ Thú board layout:
 * Row 0 is top (Blue side - "Đội Lam Sơn"), Row 8 is bottom (Red side - "Đội Hồng Lạc").
 *
 * Dens (Hang ổ):
 * - Blue Den: (row: 0, col: 3)
 * - Red Den:  (row: 8, col: 3)
 *
 * Traps (Bẫy):
 * - Blue Traps: (0, 2), (0, 4), (1, 3)
 * - Red Traps:  (8, 2), (8, 4), (7, 3)
 *
 * Rivers (Sông):
 * - Rows 3, 4, 5 at Cols 1, 2 (Left River) and Cols 4, 5 (Right River)
 */
export function getCellType(row: number, col: number): CellType {
  if (row === 0 && col === 3) return "den_blue";
  if (row === 8 && col === 3) return "den_red";

  if ((row === 0 && (col === 2 || col === 4)) || (row === 1 && col === 3)) {
    return "trap_blue";
  }
  if ((row === 8 && (col === 2 || col === 4)) || (row === 7 && col === 3)) {
    return "trap_red";
  }

  if (row >= 3 && row <= 5 && (col === 1 || col === 2 || col === 4 || col === 5)) {
    return "river";
  }

  return "land";
}

export function isRiverCell(pos: Position): boolean {
  return getCellType(pos.row, pos.col) === "river";
}

export function isOwnDen(pos: Position, player: Player): boolean {
  const cell = getCellType(pos.row, pos.col);
  return (player === "red" && cell === "den_red") || (player === "blue" && cell === "den_blue");
}

export function isOpponentDen(pos: Position, player: Player): boolean {
  const cell = getCellType(pos.row, pos.col);
  return (player === "red" && cell === "den_blue") || (player === "blue" && cell === "den_red");
}

export function isInOpponentTrap(pos: Position, pieceOwner: Player): boolean {
  const cell = getCellType(pos.row, pos.col);
  // If Red piece is in Blue's trap (around Blue's den), or Blue piece is in Red's trap (around Red's den),
  //Wait: in Animal Chess, a trap weakens the *enemy* piece that steps into *your* trap!
  // Let's verify standard rule:
  // Traps around Blue's den belong to Blue ("trap_blue"). Any RED piece inside "trap_blue" has rank 0 so Blue can capture it easily!
  // Traps around Red's den belong to Red ("trap_red"). Any BLUE piece inside "trap_red" has rank 0 so Red can capture it easily!
  if (pieceOwner === "red" && cell === "trap_blue") return true;
  if (pieceOwner === "blue" && cell === "trap_red") return true;
  return false;
}

export function isWithinBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_ROWS && pos.col >= 0 && pos.col < BOARD_COLS;
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Determines whether attacker can capture defender at defender.position
 */
export function canCapturePiece(attacker: GamePiece, defender: GamePiece): boolean {
  if (attacker.player === defender.player) return false;

  const attackerInRiver = isRiverCell(attacker.position);
  const defenderInRiver = isRiverCell(defender.position);

  // Rule: Pieces cannot capture across water-land boundary!
  // A mouse in the river cannot capture an elephant (or another mouse) on land,
  // and a piece on land cannot capture a mouse in the river.
  if (attackerInRiver !== defenderInRiver) {
    return false;
  }

  // Rule: If defender is sitting in attacker's trap (i.e. opponent trap relative to defender),
  // defender's effective rank is 0, so ANY attacker can capture it!
  if (isInOpponentTrap(defender.position, defender.player)) {
    return true;
  }

  // Special Rule: Rat (Mouse, rank 1) vs Elephant (rank 8)
  if (attacker.type === "mouse" && defender.type === "elephant") {
    return true;
  }
  if (attacker.type === "elephant" && defender.type === "mouse") {
    return false;
  }

  // Standard rank comparison
  return attacker.rank >= defender.rank;
}

export function createInitialPieces(): GamePiece[] {
  const buildPiece = (
    player: Player,
    type: AnimalType,
    row: number,
    col: number
  ): GamePiece => {
    const meta = ANIMAL_METADATA[type];
    return {
      id: `${player}-${type}`,
      type,
      player,
      rank: meta.rank,
      nameVi: meta.nameVi,
      titleVi: meta.titleVi,
      position: { row, col },
    };
  };

  return [
    // Blue Player (Top: Rows 0-2) - "Đội Lam Sơn"
    buildPiece("blue", "lion", 0, 0),
    buildPiece("blue", "tiger", 0, 6),
    buildPiece("blue", "dog", 1, 1),
    buildPiece("blue", "cat", 1, 5),
    buildPiece("blue", "mouse", 2, 0),
    buildPiece("blue", "leopard", 2, 2),
    buildPiece("blue", "wolf", 2, 4),
    buildPiece("blue", "elephant", 2, 6),

    // Red Player (Bottom: Rows 6-8) - "Đội Hồng Lạc"
    buildPiece("red", "elephant", 6, 0),
    buildPiece("red", "wolf", 6, 2),
    buildPiece("red", "leopard", 6, 4),
    buildPiece("red", "mouse", 6, 6),
    buildPiece("red", "cat", 7, 1),
    buildPiece("red", "dog", 7, 5),
    buildPiece("red", "tiger", 8, 0),
    buildPiece("red", "lion", 8, 6),
  ];
}

