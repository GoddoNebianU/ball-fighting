/**
 * 共享血包系统
 * 处理血包的生成、拾取和生命周期
 */

import { GAME_CONFIG } from "../types";

export interface HealthPackConfig {
  id: string;
  position: { x: number; y: number };
  healAmount: number;
}

export interface HealthPack {
  id: string;
  position: { x: number; y: number };
  healAmount: number;
  spawnTime: number;
  despawnTime: number;
  active: boolean;
}

export class HealthPackSystem {
  private static readonly SPAWN_INTERVAL = 10000; // 10秒生成一次
  private static readonly DESPAWN_DELAY = 15000; // 15秒后消失
  private static readonly MAX_HEALTH_PACKS = 3;

  /**
   * 创建血包
   */
  static createHealthPack(config: HealthPackConfig): HealthPack {
    const now = Date.now();
    return {
      id: config.id,
      position: config.position,
      healAmount: config.healAmount,
      spawnTime: now,
      despawnTime: now + this.DESPAWN_DELAY,
      active: true,
    };
  }

  /**
   * 生成随机血包位置
   */
  static generateRandomPosition(): { x: number; y: number } {
    const halfWidth = GAME_CONFIG.STAGE_WIDTH / 2 - 50;
    const halfHeight = GAME_CONFIG.STAGE_HEIGHT / 2 - 50;

    return {
      x: Math.random() * 2 * halfWidth - halfWidth,
      y: Math.random() * 2 * halfHeight - halfHeight,
    };
  }

  /**
   * 检查是否需要生成新血包
   */
  static shouldSpawnHealthPack(
    existingPacks: HealthPack[],
    lastSpawnTime: number,
  ): boolean {
    if (existingPacks.length >= this.MAX_HEALTH_PACKS) {
      return false;
    }

    const now = Date.now();
    return now - lastSpawnTime > this.SPAWN_INTERVAL;
  }

  /**
   * 检查血包是否过期
   */
  static isExpired(healthPack: HealthPack): boolean {
    return Date.now() > healthPack.despawnTime;
  }

  /**
   * 检查玩家与血包的碰撞
   */
  static checkCollision(
    healthPack: HealthPack,
    player: {
      position: { x: number; y: number };
      isDead: boolean;
      health: number;
      maxHealth: number;
    },
    playerRadius: number,
    healthPackRadius: number,
  ): boolean {
    if (!healthPack.active) return false;
    if (player.isDead) return false;
    if (player.health >= player.maxHealth) return false;

    const dx = player.position.x - healthPack.position.x;
    const dy = player.position.y - healthPack.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < playerRadius + healthPackRadius;
  }

  /**
   * 使用血包
   */
  static consumeHealthPack(healthPack: HealthPack): HealthPack {
    return { ...healthPack, active: false };
  }

  /**
   * 计算治疗量
   */
  static calculateHeal(
    currentHealth: number,
    maxHealth: number,
    healAmount: number,
  ): number {
    return Math.min(maxHealth, currentHealth + healAmount);
  }
}
