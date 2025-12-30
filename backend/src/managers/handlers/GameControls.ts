/**
 * 游戏控制处理器
 * 处理游戏开始、重启、玩家输入和动作
 */

import { Server, Socket } from "socket.io";
import { GameRoom } from "../../rooms/GameRoom";
import type {
  StartGameEvent,
  RestartGameEvent,
  PlayerInputEvent,
  PlayerActionEvent,
  ChatMessageEvent,
} from "../../types";

export class GameControls {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public startGame(
    socket: Socket,
    data: StartGameEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
    getPlayerId: (socketId: string) => string | undefined,
  ): void {
    const playerId = getPlayerId(socket.id);
    if (!playerId) return;

    const room = getRoom(data.roomId);
    if (!room) return;

    // 检查是否为房主
    if (!room.isHost(playerId)) {
      console.log(`[RoomManager] 非房主无法开始游戏: ${playerId}`);
      return;
    }

    room.startGame();

    console.log(`[RoomManager] 房间 ${data.roomId} 开始游戏`);
  }

  public restartGame(
    socket: Socket,
    data: RestartGameEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
    getPlayerId: (socketId: string) => string | undefined,
  ): void {
    const playerId = getPlayerId(socket.id);
    if (!playerId) return;

    const room = getRoom(data.roomId);
    if (!room) return;

    // 检查是否为房主
    if (!room.isHost(playerId)) {
      return;
    }

    room.restartGame();

    console.log(`[RoomManager] 房间 ${data.roomId} 重新开始游戏`);
  }

  public handlePlayerInput(
    socket: Socket,
    data: PlayerInputEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
  ): void {
    const room = getRoom(data.roomId);
    if (!room) return;

    room.handlePlayerInput(data.playerId, data.input);
  }

  public handlePlayerAction(
    socket: Socket,
    data: PlayerActionEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
  ): void {
    const room = getRoom(data.roomId);
    if (!room) return;

    room.handlePlayerAction(data.playerId, data);
  }

  public handleChatMessage(
    socket: Socket,
    data: ChatMessageEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
  ): void {
    const room = getRoom(data.roomId);
    if (!room) return;

    room.handleChatMessage(data.playerId, data.message);
  }
}
