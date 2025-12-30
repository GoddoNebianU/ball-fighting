/**
 * AI 目标选择器
 * 根据距离、血量和仇恨选择最佳攻击目标
 */

import { Fighter } from "../fighter/Fighter";

export class AITargetSelector {
  public selectBestTarget(
    ai: Fighter,
    aliveTargets: Fighter[],
  ): {
    target: Fighter;
    targetDistance: number;
  } {
    let bestTarget = aliveTargets[0];
    let bestScore = -Infinity;
    let bestDist = 0;

    for (const t of aliveTargets) {
      const dist = this.getDistance(ai, t);
      let score = 1000 - dist + (100 - t.health);

      if (ai.lastAttacker === t) {
        score += 500;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = t;
        bestDist = dist;
      }
    }

    return { target: bestTarget, targetDistance: bestDist };
  }

  private getDistance(f1: Fighter, f2: Fighter): number {
    const dx = f1.x - f2.x;
    const dy = f1.y - f2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
