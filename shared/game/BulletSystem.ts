/**
 * 共享子弹系统
 * 处理子弹的创建、移动和生命周期
 */

import { GAME_CONFIG } from "../types";

export interface BulletConfig {
  ownerId: string;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  damage: number;
  knockback: number;
}

export interface Bullet {
  id: string;
  ownerId: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  knockback: number;
  active: boolean;
  creationTime: number;
}

export class BulletSystem {
  /**
   * 创建子弹
   */
  static createBullet(config: BulletConfig, id: string): Bullet {
    return {
      id,
      ownerId: config.ownerId,
      position: { x: config.x, y: config.y },
      velocity: {
        x: Math.cos(config.rotation) * config.speed,
        y: Math.sin(config.rotation) * config.speed,
      },
      damage: config.damage,
      knockback: config.knockback,
      active: true,
      creationTime: Date.now(),
    };
  }

  /**
   * 更新子弹位置
   */
  static updateBullet(
    bullet: Bullet,
    deltaTime: number,
  ): { bullet: Bullet; isOutOfBounds: boolean } {
    const newX = bullet.position.x + bullet.velocity.x * deltaTime;
    const newY = bullet.position.y + bullet.velocity.y * deltaTime;

    const updatedBullet = {
      ...bullet,
      position: { x: newX, y: newY },
    };

    // 检查是否超出场地边界
    const halfWidth = GAME_CONFIG.STAGE_WIDTH / 2;
    const halfHeight = GAME_CONFIG.STAGE_HEIGHT / 2;

    const isOutOfBounds =
      newX < -halfWidth ||
      newX > halfWidth ||
      newY < -halfHeight ||
      newY > halfHeight;

    return { bullet: updatedBullet, isOutOfBounds };
  }

  /**
   * 销毁子弹
   */
  static destroyBullet(bullet: Bullet): Bullet {
    return { ...bullet, active: false };
  }

  /**
   * 过滤不活跃的子弹
   */
  static filterActiveBullets(bullets: Bullet[]): Bullet[] {
    return bullets.filter((b) => b.active);
  }

  /**
   * 计算子弹击退效果
   */
  static calculateKnockback(
    bulletPosition: { x: number; y: number },
    victimPosition: { x: number; y: number },
    knockbackForce: number,
  ): { x: number; y: number } {
    const dx = victimPosition.x - bulletPosition.x;
    const dy = victimPosition.y - bulletPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: (dx / distance) * knockbackForce,
      y: (dy / distance) * knockbackForce,
    };
  }
}
