/**
 * 房间游戏循环管理器
 * 处理玩家移动、攻击更新
 */

import type { RoomPlayer } from "./RoomPlayerManager";

export class RoomGameLoop {
  private readonly STAGE_WIDTH = 1200;
  private readonly STAGE_HEIGHT = 800;
  private readonly PLAYER_RADIUS = 25;
  private readonly WALK_SPEED = 180;

  public updatePlayerMovement(player: RoomPlayer, deltaTime: number): void {
    if (player.isDead) return;

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
    player.x += dx * this.WALK_SPEED * deltaTime;
    player.y += dy * this.WALK_SPEED * deltaTime;

    // 更新旋转（移动时面向移动方向）
    if (dx !== 0 || dy !== 0) {
      player.rotation = Math.atan2(dy, dx);
    }

    // 限制在场地内
    this.clampPlayerPosition(player);
  }

  private clampPlayerPosition(player: RoomPlayer): void {
    player.x = Math.max(
      -this.STAGE_WIDTH / 2 + this.PLAYER_RADIUS,
      Math.min(this.STAGE_WIDTH / 2 - this.PLAYER_RADIUS, player.x),
    );
    player.y = Math.max(
      -this.STAGE_HEIGHT / 2 + this.PLAYER_RADIUS,
      Math.min(this.STAGE_HEIGHT / 2 - this.PLAYER_RADIUS, player.y),
    );
  }

  public updatePlayerAttack(
    player: RoomPlayer,
    currentTime: number,
    onCreateBullet: (bullet: {
      ownerId: string;
      x: number;
      y: number;
      rotation: number;
      speed: number;
      damage: number;
    }) => void,
  ): void {
    if (player.isDead || !player.input.attack) return;

    const attackCooldown = 300; // 300ms 攻击冷却
    if (
      player.lastAttackTime &&
      currentTime - player.lastAttackTime < attackCooldown
    ) {
      return;
    }

    player.lastAttackTime = currentTime;

    // 根据武器类型发射子弹
    // 简化版本：所有武器都发射子弹
    onCreateBullet({
      ownerId: player.id,
      x: player.x + Math.cos(player.rotation) * 30,
      y: player.y + Math.sin(player.rotation) * 30,
      rotation: player.rotation,
      speed: 800,
      damage: 15,
    });
  }
}
