/**
 * 共享碰撞检测系统
 * 处理圆形碰撞检测
 */

import { GAME_CONFIG } from "../types";

export class CollisionSystem {
  /**
   * 检测两个圆形是否碰撞
   */
  static circleCollision(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number },
    radius1: number,
    radius2: number,
  ): boolean {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  /**
   * 计算两点之间的距离
   */
  static distance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number },
  ): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 检测点是否在场地的边界内
   */
  static isInBounds(x: number, y: number): boolean {
    const halfWidth = GAME_CONFIG.STAGE_WIDTH / 2;
    const halfHeight = GAME_CONFIG.STAGE_HEIGHT / 2;
    return (
      x >= -halfWidth && x <= halfWidth && y >= -halfHeight && y <= halfHeight
    );
  }

  /**
   * 限制坐标在场地边界内
   */
  static clampToBounds(
    x: number,
    y: number,
    radius: number,
  ): { x: number; y: number } {
    const halfWidth = GAME_CONFIG.STAGE_WIDTH / 2 - radius;
    const halfHeight = GAME_CONFIG.STAGE_HEIGHT / 2 - radius;

    return {
      x: Math.max(-halfWidth, Math.min(halfWidth, x)),
      y: Math.max(-halfHeight, Math.min(halfHeight, y)),
    };
  }

  /**
   * 检测子弹与玩家的碰撞
   */
  static checkBulletPlayerCollision(
    bullet: {
      position: { x: number; y: number };
      velocity: { x: number; y: number };
      active: boolean;
    },
    player: {
      id: string;
      position: { x: number; y: number };
      isDead: boolean;
    },
    playerRadius: number,
  ): boolean {
    if (!bullet.active) return false;
    if (player.isDead) return false;

    return this.circleCollision(
      bullet.position,
      player.position,
      GAME_CONFIG.PLAYER_RADIUS,
      playerRadius,
    );
  }
}
