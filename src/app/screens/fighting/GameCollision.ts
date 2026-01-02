import { Fighter } from "./fighter/Fighter";
import { AttackData } from "./fighter/FighterTypes";

export class GameCollision {
  private fighters: Fighter[];

  constructor(fighters: Fighter[]) {
    this.fighters = fighters;
  }

  updateFighters(fighters: Fighter[]): void {
    this.fighters = fighters;
  }

  checkMeleeCollisions(
    onHit: (target: Fighter, data: AttackData, attacker: Fighter) => void,
  ): void {
    for (const attacker of this.fighters) {
      if (attacker.isDead) continue;
      const attack = attacker.getCurrentAttack();
      if (attack.isActive && attack.data && !attack.data.projectile) {
        for (const target of this.fighters) {
          if (attacker === target || target.isDead) continue;
          const dist = this.getDistance(attacker, target);
          if (dist < attack.data.range + Fighter.CONFIG.radius) {
            onHit(target, attack.data, attacker);
            attacker.markHit();
            break;
          }
        }
      }
    }
  }

  clampPositions(stageWidth: number, stageHeight: number): void {
    const hw = stageWidth / 2 - Fighter.CONFIG.radius;
    const hh = stageHeight / 2 - Fighter.CONFIG.radius;
    const minDist = Fighter.CONFIG.radius * 2;

    this.fighters.forEach((p) => {
      if (p.isDead) return;
      p.x = Math.max(-hw, Math.min(hw, p.x));
      p.y = Math.max(-hh, Math.min(hh, p.y));
    });

    for (let i = 0; i < this.fighters.length; i++) {
      for (let j = i + 1; j < this.fighters.length; j++) {
        const f1 = this.fighters[i],
          f2 = this.fighters[j];
        if (f1.isDead || f2.isDead) continue;
        const dx = f2.x - f1.x,
          dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2,
            nx = dx / dist,
            ny = dy / dist;
          f1.x -= nx * overlap;
          f1.y -= ny * overlap;
          f2.x += nx * overlap;
          f2.y += ny * overlap;
        }
      }
    }
  }

  private getDistance(f1: Fighter, f2: Fighter): number {
    const dx = f1.x - f2.x,
      dy = f1.y - f2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
