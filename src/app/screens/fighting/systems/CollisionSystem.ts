/**
 * 游戏碰撞检测系统
 * 处理近战攻击、子弹碰撞、位置限制
 */

import { Fighter } from "../fighter/Fighter";
import { BulletManager } from "../combat/BulletManager";
import { EffectManager } from "../combat/EffectManager";

export class CollisionSystem {
  constructor(
    private stageWidth: number,
    private stageHeight: number,
    private bullets: BulletManager,
    private effectManager: EffectManager,
  ) {}

  public checkMeleeCollisions(allPlayers: Fighter[]): void {
    // 检查每个攻击者对其他所有人的攻击
    for (const attacker of allPlayers) {
      const attack = attacker.getCurrentAttack();
      if (attack.isActive && attack.data) {
        if (attack.data.projectile && !attack.hasHit) {
          // 投射物攻击 - 生成子弹
          this.bullets.spawnBullet(attacker, attack.angle, attack.data);

          // 创建射击特效
          this.effectManager.createShootingEffect(
            attacker,
            attacker.currentWeapon,
            attack.angle,
          );

          attacker.markHit();
        } else if (!attack.data.projectile) {
          // 近战攻击 - 检查所有目标
          for (const target of allPlayers) {
            if (attacker === target) continue; // 不攻击自己

            const dist = this.getDistance(attacker, target);
            if (dist < attack.data.range + Fighter.CONFIG.radius) {
              target.takeHit(
                attack.data.damage,
                attack.data.knockback,
                attacker.x,
                attacker.y,
                attacker,
              );
              attacker.markHit();
              break; // 近战攻击只命中一个目标
            }
          }
        }
      }
    }
  }

  public clampPositions(allPlayers: Fighter[]): void {
    const hw = this.stageWidth / 2 - Fighter.CONFIG.radius;
    const hh = this.stageHeight / 2 - Fighter.CONFIG.radius;

    // 限制在舞台范围内
    allPlayers.forEach((p) => {
      p.x = Math.max(-hw, Math.min(hw, p.x));
      p.y = Math.max(-hh, Math.min(hh, p.y));
    });

    // 角色间碰撞
    const minDist = Fighter.CONFIG.radius * 2;

    for (let i = 0; i < allPlayers.length; i++) {
      for (let j = i + 1; j < allPlayers.length; j++) {
        const f1 = allPlayers[i];
        const f2 = allPlayers[j];
        const dx = f2.x - f1.x;
        const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          f1.x -= nx * overlap;
          f1.y -= ny * overlap;
          f2.x += nx * overlap;
          f2.y += ny * overlap;
        }
      }
    }
  }

  private getDistance(f1: Fighter, f2: Fighter): number {
    const dx = f1.x - f2.x;
    const dy = f1.y - f2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
