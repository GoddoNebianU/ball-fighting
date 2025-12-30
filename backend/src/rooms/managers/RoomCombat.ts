/**
 * 房间战斗管理器
 * 处理子弹移动、碰撞检测、血包生成
 */

import type { BulletState, HealthPackState } from "../../types";
import type { RoomPlayer } from "./RoomPlayerManager";

export class RoomCombat {
  private bullets: Map<string, BulletState> = new Map();
  private healthPacks: Map<string, HealthPackState> = new Map();
  private lastHealthPackSpawn: number | undefined;

  private readonly STAGE_WIDTH = 800;
  private readonly STAGE_HEIGHT = 600;
  private readonly BULLET_SPEED = 800;
  private readonly MAX_HEALTH = 200;

  public updateBullets(
    deltaTime: number,
    onBulletHit: (bulletId: string, targetId: string, damage: number) => void,
    onBulletDestroy: (bulletId: string) => void,
  ): void {
    const bulletsToDestroy: string[] = [];

    this.bullets.forEach((bullet) => {
      // 移动子弹 - 根据 velocity 更新 position
      bullet.position.x += bullet.velocity.x * deltaTime;
      bullet.position.y += bullet.velocity.y * deltaTime;

      // 检查是否超出场地
      if (
        Math.abs(bullet.position.x) > this.STAGE_WIDTH / 2 ||
        Math.abs(bullet.position.y) > this.STAGE_HEIGHT / 2
      ) {
        bulletsToDestroy.push(bullet.id);
      }
    });

    bulletsToDestroy.forEach((id) => {
      this.bullets.delete(id);
      onBulletDestroy(id);
    });
  }

  public checkBulletCollision(
    bulletId: string,
    players: RoomPlayer[],
    onHit: (bulletId: string, targetId: string, damage: number) => void,
  ): void {
    const bullet = this.bullets.get(bulletId);
    if (!bullet) return;

    for (const player of players) {
      if (player.isDead || player.id === bullet.ownerId) continue;

      const dx = player.x - bullet.position.x;
      const dy = player.y - bullet.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 25) {
        // 命中
        onHit(bulletId, player.id, bullet.damage);
        this.bullets.delete(bulletId);
        break;
      }
    }
  }

  public spawnBullet(bullet: BulletState): void {
    this.bullets.set(bullet.id, bullet);
  }

  public getBullet(bulletId: string): BulletState | undefined {
    return this.bullets.get(bulletId);
  }

  public updateHealthPacks(
    currentTime: number,
    deltaTime: number,
    onSpawn: (pack: HealthPackState) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onConsume: (packId: string, playerId: string, healAmount: number) => void,
  ): void {
    // 每 10 秒生成一个血包
    if (
      !this.lastHealthPackSpawn ||
      currentTime - this.lastHealthPackSpawn > 10000
    ) {
      if (this.healthPacks.size < 3) {
        this.spawnHealthPack(onSpawn);
        this.lastHealthPackSpawn = currentTime;
      }
    }
  }

  public checkHealthPackCollision(
    players: RoomPlayer[],
    onConsume: (packId: string, playerId: string, healAmount: number) => void,
  ): void {
    this.healthPacks.forEach((pack) => {
      for (const player of players) {
        if (player.isDead) continue;

        const dx = player.x - pack.position.x;
        const dy = player.y - pack.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 25) {
          const healAmount = Math.min(50, this.MAX_HEALTH - player.health);
          if (healAmount > 0) {
            onConsume(pack.id, player.id, healAmount);
            this.healthPacks.delete(pack.id);
            break;
          }
        }
      }
    });
  }

  private spawnHealthPack(onSpawn: (pack: HealthPackState) => void): void {
    const pack: HealthPackState = {
      id: `pack_${Date.now()}_${Math.random()}`,
      position: {
        x: (Math.random() - 0.5) * (this.STAGE_WIDTH - 100),
        y: (Math.random() - 0.5) * (this.STAGE_HEIGHT - 100),
      },
      value: 50,
      active: true,
    };

    this.healthPacks.set(pack.id, pack);
    console.log(`[GameRoom] 血包已生成: ${pack.id}`);
    onSpawn(pack);
  }

  public clear(): void {
    this.bullets.clear();
    this.healthPacks.clear();
    this.lastHealthPackSpawn = undefined;
  }

  public getBullets(): BulletState[] {
    return Array.from(this.bullets.values());
  }

  public getHealthPacks(): HealthPackState[] {
    return Array.from(this.healthPacks.values());
  }
}
