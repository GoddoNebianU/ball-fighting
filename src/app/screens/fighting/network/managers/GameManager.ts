/**
 * 游戏操作管理器
 * 封装游戏中的输入和动作 API
 */

import { NetworkAPI } from "../NetworkAPI";

export class GameManager {
  constructor(private api: NetworkAPI) {}

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
    this.api.sendPlayerInput(roomId, playerId, input, position, rotation);
  }

  public sendPlayerAction(
    roomId: string,
    playerId: string,
    action: {
      action: "attack" | "block" | "weapon_switch";
      data?: { weaponIndex?: number; angle?: number };
    },
  ): void {
    this.api.sendPlayerAction(roomId, playerId, action);
  }

  public sendChatMessage(
    roomId: string,
    playerId: string,
    message: string,
  ): void {
    this.api.sendChatMessage(roomId, playerId, message);
  }
}
