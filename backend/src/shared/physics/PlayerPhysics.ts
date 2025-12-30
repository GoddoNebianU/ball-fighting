/**
 * 共享玩家物理逻辑
 * 处理玩家移动、边界限制等
 */

import { GAME_CONFIG } from "../types";

export class PlayerPhysics {
  static updatePosition(
    player: {
      x: number;
      y: number;
      input: { up: boolean; down: boolean; left: boolean; right: boolean };
    },
    deltaTime: number,
  ): { x: number; y: number } {
    let dx = 0;
    let dy = 0;

    if (player.input.up) dy -= 1;
    if (player.input.down) dy += 1;
    if (player.input.left) dx -= 1;
    if (player.input.right) dx += 1;

    // 标准化向量
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    // 更新位置
    const newX = player.x + dx * GAME_CONFIG.PLAYER_SPEED * deltaTime;
    const newY = player.y + dy * GAME_CONFIG.PLAYER_SPEED * deltaTime;

    // 边界限制
    const halfWidth = GAME_CONFIG.STAGE_WIDTH / 2 - GAME_CONFIG.PLAYER_RADIUS;
    const halfHeight = GAME_CONFIG.STAGE_HEIGHT / 2 - GAME_CONFIG.PLAYER_RADIUS;

    return {
      x: Math.max(-halfWidth, Math.min(halfWidth, newX)),
      y: Math.max(-halfHeight, Math.min(halfHeight, newY)),
    };
  }
}
