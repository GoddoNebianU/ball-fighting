import { Fighter } from "./fighter/Fighter";
import { AttackData } from "./fighter/FighterTypes";

/** 游戏碰撞检测系统 */
export class GameCollision {
  private fighters: Fighter[];

  constructor(fighters: Fighter[]) {
    this.fighters = fighters;
  }

  /** 更新角色列表 */
  public updateFighters(fighters: Fighter[]): void {
    this.fighters = fighters;
  }

  /** 检查近战攻击碰撞 */
  public checkMeleeCollisions(
    onHit: (target: Fighter, data: AttackData, attacker: Fighter) => void,
  ): void {
    // 检查每个攻击者对其他所有人的攻击
    for (const attacker of this.fighters) {
      const attack = attacker.getCurrentAttack();
      if (attack.isActive && attack.data) {
        if (attack.data.projectile && !attack.hasHit) {
          // 投射物攻击 - 返回true让外部处理子弹生成
          continue;
        } else if (!attack.data.projectile) {
          // 近战攻击 - 检查所有目标
          for (const target of this.fighters) {
            if (attacker === target) continue; // 不攻击自己

            const dist = this.getDistance(attacker, target);
            if (dist < attack.data.range + Fighter.CONFIG.radius) {
              onHit(target, attack.data, attacker);
              attacker.markHit();
              break; // 近战攻击只命中一个目标
            }
          }
        }
      }
    }
  }

  /** 限制角色位置 */
  public clampPositions(stageWidth: number, stageHeight: number): void {
    const hw = stageWidth / 2 - Fighter.CONFIG.radius;
    const hh = stageHeight / 2 - Fighter.CONFIG.radius;

    // 限制在舞台范围内
    this.fighters.forEach((p) => {
      p.x = Math.max(-hw, Math.min(hw, p.x));
      p.y = Math.max(-hh, Math.min(hh, p.y));
    });

    // 角色间碰撞
    const minDist = Fighter.CONFIG.radius * 2;

    for (let i = 0; i < this.fighters.length; i++) {
      for (let j = i + 1; j < this.fighters.length; j++) {
        const f1 = this.fighters[i];
        const f2 = this.fighters[j];
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
