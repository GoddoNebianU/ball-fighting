/**
 * 机枪特效渲染器
 */

import { Graphics } from "pixi.js";

export class MachineGunEffectRenderer {
  public drawEffect(
    graphics: Graphics,
    radius: number,
    range: number,
    progress: number,
  ): void {
    const bulletCount = 8;
    const spread = 15;

    for (let i = 0; i < bulletCount; i++) {
      const delay = i * 0.12;
      const adjustedProgress = Math.max(
        0,
        Math.min(1, (progress - delay) / (1 / bulletCount)),
      );

      if (adjustedProgress > 0) {
        const bulletDist = radius + adjustedProgress * range * 1.5;
        const bulletX = bulletDist;
        const bulletY = (i - bulletCount / 2) * spread * adjustedProgress;

        // 子弹光晕
        graphics.circle(bulletX, bulletY, 8).fill({
          color: 0xffff00,
          alpha: (1 - adjustedProgress * 0.6) * 0.5,
        });

        // 子弹核心
        graphics.circle(bulletX, bulletY, 4).fill({
          color: 0xff4400,
          alpha: 1 - adjustedProgress * 0.3,
        });

        // 子弹轨迹线
        if (adjustedProgress > 0.3) {
          graphics
            .moveTo(radius, 0)
            .lineTo(bulletX, bulletY)
            .stroke({
              width: 2,
              color: 0xffaa00,
              alpha: adjustedProgress * 0.8,
            });
        }
      }
    }

    // 超级炫酷的枪口火焰
    const muzzleSize = 18 + Math.sin(progress * Math.PI * 4) * 5;
    graphics
      .circle(radius, 0, muzzleSize)
      .fill({ color: 0xff8800, alpha: 0.95 });
    graphics
      .circle(radius, 0, muzzleSize * 0.6)
      .fill({ color: 0xffff00, alpha: 1 });
    graphics
      .circle(radius, 0, muzzleSize * 0.3)
      .fill({ color: 0xffffff, alpha: 1 });
  }
}
