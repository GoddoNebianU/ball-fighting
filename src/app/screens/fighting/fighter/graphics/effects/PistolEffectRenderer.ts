/**
 * 手枪特效渲染器
 */

import { Graphics } from "pixi.js";

export class PistolEffectRenderer {
  public drawEffect(
    graphics: Graphics,
    radius: number,
    range: number,
    progress: number,
  ): void {
    const bulletDist = range * progress * 1.5;
    const bulletX = bulletDist;
    const bulletY = 0;

    graphics.circle(radius, 0, 15).fill({ color: 0xffff00, alpha: 0.8 });
    graphics.circle(bulletX, bulletY, 8).fill({ color: 0xff0000, alpha: 0.9 });
    graphics
      .moveTo(radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({ width: 3, color: 0xffaa00, alpha: 0.6 });
  }
}
