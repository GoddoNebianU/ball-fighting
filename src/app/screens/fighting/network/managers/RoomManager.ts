/**
 * 房间操作管理器
 * 封装所有房间相关的 API 调用
 */

import { NetworkAPI } from "../NetworkAPI";

export class RoomManager {
  constructor(private api: NetworkAPI) {}

  public createRoom(config: {
    roomName: string;
    password?: string;
    maxPlayers: number;
    playerConfig: { name: string; color: number };
  }): void {
    this.api.createRoom(config);
  }

  public joinRoom(
    roomId: string,
    password: string | undefined,
    playerConfig: { name: string; color: number },
  ): void {
    this.api.joinRoom(roomId, password, playerConfig);
  }

  public leaveRoom(roomId: string): void {
    this.api.leaveRoom(roomId);
  }

  public getRoomList(): void {
    this.api.getRoomList();
  }

  public startGame(roomId: string, playerId: string): void {
    this.api.startGame(roomId, playerId);
  }

  public restartGame(roomId: string, playerId: string): void {
    this.api.restartGame(roomId, playerId);
  }
}
