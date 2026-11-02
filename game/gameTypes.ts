export type AnimalType =
  | "elephant" // 8 - Voi Việt Nam (Voi Bản Đôn)
  | "lion"     // 7 - Sư Tử Sơn Lâm (Nghê / Sư Tử)
  | "tiger"    // 6 - Hổ Đông Dương
  | "leopard"  // 5 - Báo Hoa Mai
  | "wolf"     // 4 - Sói Rừng
  | "dog"      // 3 - Chó Phú Quốc
  | "cat"      // 2 - Mèo Mướp
  | "mouse";   // 1 - Chuột Đồng

export type Player = "red" | "blue";

export type Position = {
  row: number; // 0 to 8 (9 rows)
  col: number; // 0 to 6 (7 cols)
};

export type CellType = "land" | "river" | "trap_red" | "trap_blue" | "den_red" | "den_blue";

export type GamePiece = {
  id: string;
  type: AnimalType;
  player: Player;
  rank: number;
  nameVi: string;
  titleVi: string;
  position: Position;
};

export type MoveType = "normal" | "swim" | "jump" | "capture" | "jump_capture";

export type ValidMove = {
  from: Position;
  to: Position;
  moveType: MoveType;
  targetPieceId?: string;
};

export type MoveRecord = {
  pieceId: string;
  pieceType: AnimalType;
  player: Player;
  from: Position;
  to: Position;
  moveType: MoveType;
  capturedPiece?: GamePiece;
  timestamp: number;
  boardSnapshot: GamePiece[];
};

export type GameMode = "single" | "local" | "online";

export type AIDifficulty = "easy" | "normal" | "hard";

export type GameStatus = "menu" | "playing" | "paused" | "victory";

export type CameraViewMode = "isometric" | "topdown";

export type ActiveAnimation = {
  id: string;
  pieceId: string;
  from: Position;
  to: Position;
  moveType: MoveType;
  capturedPiece?: GamePiece;
  startTime: number;
  duration: number;
};

export type InvalidMoveFeedback = {
  pieceId: string;
  targetPosition: Position;
  reasonVi: string;
  timestamp: number;
};

export type GameState = {
  pieces: GamePiece[];
  currentPlayer: Player;
  selectedPiece: GamePiece | null;
  validMoves: ValidMove[];
  winner: Player | null;
  winReasonVi: string | null;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  capturedPieces: {
    red: GamePiece[]; // Red pieces captured by Blue
    blue: GamePiece[]; // Blue pieces captured by Red
  };
  moveHistory: MoveRecord[];
  status: GameStatus;
  isAIThinking: boolean;
  activeAnimation: ActiveAnimation | null;
  invalidMoveFeedback: InvalidMoveFeedback | null;
  lastMove: { from: Position; to: Position } | null;
};

// Online Multiplayer Architecture Abstractions
export type OnlinePlayerInfo = {
  id: string;
  name: string;
  side: Player;
  avatar: AnimalType;
  isReady: boolean;
  isConnected: boolean;
};

export type Room = {
  id: string;
  code: string;
  name: string;
  hostId: string;
  players: OnlinePlayerInfo[];
  status: "waiting" | "playing" | "finished";
  createdAt: number;
};

export type TurnPayload = {
  roomId: string;
  player: Player;
  pieceId: string;
  from: Position;
  to: Position;
  timestamp: number;
};

export interface GameSession {
  room: Room;
  gameState: GameState;
  connect: (roomId: string, playerName: string) => Promise<void>;
  disconnect: () => void;
  sendTurn: (payload: TurnPayload) => Promise<void>;
  onTurnReceived: (callback: (payload: TurnPayload) => void) => void;
}

