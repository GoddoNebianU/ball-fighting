/**
 * 狙击枪特效渲染器
 */

import { Graphics } from "pixi.js";

export class SniperEffectRenderer {
  public drawEffect(
    graphics: Graphics,
    radius: number,
    range: number,
    progress: number,
  ): void {
    const bulletDist = range * progress * 2.0;
    const bulletX = bulletDist;
    const bulletY = 0;

    // 巨大的能量聚集光环
    const chargeSize = 30 + Math.sin(progress * Math.PI) * 20;
    graphics
      .circle(radius, 0, chargeSize)
      .fill({ color: 0xff0000, alpha: 0.3 * (1 - progress) });
    graphics
      .circle(radius, 0, chargeSize * 0.7)
      .fill({ color: 0xff4400, alpha: 0.5 * (1 - progress) });

    // 超级巨大的枪口爆炸
    const explosionSize = 40 + Math.sin(progress * Math.PI * 2) * 15;
    graphics
      .circle(radius, 0, explosionSize)
      .fill({ color: 0xff8800, alpha: 0.9 });
    graphics
      .circle(radius, 0, explosionSize * 0.6)
      .fill({ color: 0xffff00, alpha: 1 });
    graphics
      .circle(radius, 0, explosionSize * 0.3)
      .fill({ color: 0xffffff, alpha: 1 });

    // 超级粗的激光束
    const beamWidth = 8 + Math.sin(progress * Math.PI) * 6;
    graphics
      .moveTo(radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth,
        color: 0xff0000,
        alpha: 1 - progress * 0.3,
      });
    graphics
      .moveTo(radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth * 0.5,
        color: 0xffff00,
        alpha: 1 - progress * 0.5,
      });

    // 巨大的发光子弹核心
    graphics.circle(bulletX, bulletY, 15).fill({ color: 0xffffff, alpha: 1 });
    graphics.circle(bulletX, bulletY, 25).fill({ color: 0xffff00, alpha: 0.8 });
    graphics.circle(bulletX, bulletY, 35).fill({ color: 0xff4400, alpha: 0.6 });

    // 冲击波效果
    const shockwaveSize = bulletDist * 0.3;
    graphics
      .circle(bulletX, bulletY, shockwaveSize)
      .stroke({ width: 4, color: 0xff0000, alpha: 1 - progress });
    graphics
      .circle(bulletX, bulletY, shockwaveSize * 0.6)
      .stroke({ width: 3, color: 0xffff00, alpha: 1 - progress });
  }
}
