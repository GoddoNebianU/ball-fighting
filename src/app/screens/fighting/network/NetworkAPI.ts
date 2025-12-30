/**
 * 网络 API 方法
 * 封装所有 Socket.io 发送请求
 */

import { Socket } from "socket.io-client";
import type { CreateRoomEvent, JoinRoomEvent } from "./types";

export class NetworkAPI {
  private socket: Socket | null;

  constructor(socket: Socket | null) {
    this.socket = socket;
  }

  public updateSocket(socket: Socket | null): void {
    this.socket = socket;
  }

  public createRoom(config: {
    roomName: string;
    password?: string;
    maxPlayers: number;
    playerConfig: { name: string; color: number };
  }): void {
    if (!this.socket) {
      console.error("[NetworkManager] 未连接到服务器");
      return;
    }

    const data: CreateRoomEvent = {
      roomName: config.roomName,
      password: config.password,
      maxPlayers: config.maxPlayers,
      playerConfig: config.playerConfig,
    };

    this.socket.emit("room:create", data);
  }

  public joinRoom(
    roomId: string,
    password: string | undefined,
    playerConfig: { name: string; color: number },
  ): void {
    if (!this.socket) {
      console.error("[NetworkManager] 未连接到服务器");
      return;
    }

    const data: JoinRoomEvent = {
      roomId,
      password,
      playerConfig,
    };

    this.socket.emit("room:join", data);
  }

  public leaveRoom(roomId: string): void {
    if (!this.socket) return;
    this.socket.emit("room:leave", { roomId });
  }

  public getRoomList(): void {
    if (!this.socket) return;
    this.socket.emit("room:list");
  }

  public startGame(roomId: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit("game:start", { roomId, playerId });
  }

  public restartGame(roomId: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit("game:restart", { roomId, playerId });
  }

  public sendPlayerInput(
    roomId: string,
    playerId: string,
    input: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      attack: boolean;
      block: boolean;
    },
    position: { x: number; y: number },
    rotation: number,
  ): void {
    if (!this.socket) return;

    this.socket.emit("player:input", {
      roomId,
      playerId,
      timestamp: Date.now(),
      input,
      position,
      rotation,
    });
  }

  public sendPlayerAction(
    roomId: string,
    playerId: string,
    action: {
      action: "attack" | "block" | "weapon_switch";
      data?: { weaponIndex?: number; angle?: number };
    },
  ): void {
    if (!this.socket) return;

    this.socket.emit("player:action", {
      roomId,
      playerId,
      timestamp: Date.now(),
      ...action,
    });
  }

  public sendChatMessage(
    roomId: string,
    playerId: string,
    message: string,
  ): void {
    if (!this.socket) return;

    this.socket.emit("chat:message", {
      roomId,
      playerId,
      message,
      timestamp: Date.now(),
    });
  }
}
