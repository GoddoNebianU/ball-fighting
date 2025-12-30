/**
 * 近战攻击特效渲染器
 * 渲染轻拳和重拳的攻击特效
 */

import { Graphics } from "pixi.js";

export class MeleeAttackEffectRenderer {
  public drawLightPunch(
    graphics: Graphics,
    attackX: number,
    attackY: number,
  ): void {
    // 轻拳: 黄色拳风
    graphics.circle(attackX, attackY, 12).fill({ color: 0xffaa00 });
  }

  public drawHeavyPunch(
    graphics: Graphics,
    progress: number,
    attackDist: number,
  ): void {
    // 重拳: 大红色冲击波
    const impactSize = 15 + Math.sin(progress * Math.PI) * 20;
    graphics.circle(attackDist, 0, impactSize).fill({
      color: 0xff4400,
      alpha: 0.7,
    });
    graphics.circle(attackDist + 10, 0, 10).fill({ color: 0xffaa00 });
  }
}
