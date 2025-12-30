/**
 * 房间状态广播器
 * 负责向客户端广播游戏状态
 */

import { Server } from "socket.io";
import { RoomCombat } from "../managers/RoomCombat";
import { RoomPlayerManager } from "../managers/RoomPlayerManager";

export class RoomStateBroadcaster {
  constructor(
    private roomId: string,
    private io: Server,
    private playerManager: RoomPlayerManager,
    private combat: RoomCombat,
  ) {}

  public broadcastGameState(roundTime: number): void {
    const players = this.playerManager.getAllPlayerStates();
    const bullets = this.combat.getBullets();
    const healthPacks = this.combat.getHealthPacks();

    this.io.to(this.roomId).emit("game:state_update", {
      players,
      bullets,
      healthPacks,
      roundTime,
    });
  }

  public broadcastChatMessage(playerId: string, message: string): void {
    this.io.to(this.roomId).emit("chat:message", {
      roomId: this.roomId,
      playerId,
      playerName:
        this.playerManager.getPlayer(playerId)?.config.name || "Unknown",
      message,
      timestamp: Date.now(),
    });
  }
}
