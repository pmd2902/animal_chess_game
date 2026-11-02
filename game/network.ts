import { GameSession, GameState, OnlinePlayerInfo, Room, TurnPayload } from "./gameTypes";

/**
 * Clean Online Multiplayer Session Abstraction.
 * Ready to be connected to WebSocket / Socket.IO / Supabase Realtime.
 * Currently uses BroadcastChannel so two browser tabs on the same machine
 * can even test real-time room synchronization out-of-the-box!
 */
export class OnlineGameSessionManager implements GameSession {
  public room: Room;
  public gameState: GameState;
  private channel: BroadcastChannel | null = null;
  private turnListeners: Array<(payload: TurnPayload) => void> = [];
  private roomListeners: Array<(room: Room) => void> = [];

  constructor(roomCode: string, initialState: GameState) {
    this.gameState = initialState;
    this.room = {
      id: `room-${roomCode.toLowerCase()}`,
      code: roomCode.toUpperCase(),
      name: `Phòng Đại Ngàn #${roomCode.toUpperCase()}`,
      hostId: "local-player-1",
      players: [
        {
          id: "local-player-1",
          name: "Kỳ Thủ Hồng Lạc",
          side: "red",
          avatar: "tiger",
          isReady: true,
          isConnected: true,
        },
      ],
      status: "waiting",
      createdAt: Date.now(),
    };
  }

  public async connect(roomCode: string, playerName: string): Promise<void> {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(`co_thu_vn_room_${roomCode.toUpperCase()}`);
      this.channel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "TURN_SUBMITTED" && data.payload) {
          this.turnListeners.forEach((cb) => cb(data.payload as TurnPayload));
        } else if (data?.type === "PLAYER_JOINED" && data.player) {
          const incoming = data.player as OnlinePlayerInfo;
          if (!this.room.players.some((p) => p.id === incoming.id)) {
            this.room.players.push(incoming);
            this.room.status = this.room.players.length >= 2 ? "playing" : "waiting";
            this.roomListeners.forEach((cb) => cb({ ...this.room }));
          }
        }
      };

      const joinPlayer: OnlinePlayerInfo = {
        id: `player-${Math.random().toString(36).slice(2, 7)}`,
        name: playerName || "Kỳ Thủ Lam Sơn",
        side: this.room.players.length === 1 ? "blue" : "red",
        avatar: "elephant",
        isReady: true,
        isConnected: true,
      };

      this.channel.postMessage({
        type: "PLAYER_JOINED",
        player: joinPlayer,
      });
    }
  }

  public disconnect(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  public async sendTurn(payload: TurnPayload): Promise<void> {
    if (this.channel) {
      this.channel.postMessage({
        type: "TURN_SUBMITTED",
        payload,
      });
    }
  }

  public onTurnReceived(callback: (payload: TurnPayload) => void): void {
    this.turnListeners.push(callback);
  }

  public onRoomUpdated(callback: (room: Room) => void): void {
    this.roomListeners.push(callback);
  }
}

