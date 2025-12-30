import { Graphics } from "pixi.js";
import { ShootingEffect } from "./EffectTypes";

/** 武器特效渲染器 */
export class WeaponEffectRenderer {
  public renderPistolEffect(
    graphics: Graphics,
    effect: ShootingEffect,
    progress: number,
  ): void {
    const bulletDist = effect.range * progress * 1.5;
    const bulletX = effect.startX + Math.cos(effect.angle) * bulletDist;
    const bulletY = effect.startY + Math.sin(effect.angle) * bulletDist;

    const muzzleOffset = 20;
    const muzzleX = effect.startX + Math.cos(effect.angle) * muzzleOffset;
    const muzzleY = effect.startY + Math.sin(effect.angle) * muzzleOffset;

    // 枪口火焰
    graphics.circle(muzzleX, muzzleY, 15).fill({
      color: 0xffff00,
      alpha: 0.8 * (1 - progress),
    });

    // 子弹
    graphics.circle(bulletX, bulletY, 8).fill({
      color: 0xff0000,
      alpha: 0.9 * (1 - progress * 0.3),
    });

    // 子弹轨迹
    graphics
      .moveTo(muzzleX, muzzleY)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: 3,
        color: 0xffaa00,
        alpha: 0.6 * (1 - progress),
      });
  }

  public renderMachineGunEffect(
    graphics: Graphics,
    effect: ShootingEffect,
    progress: number,
  ): void {
    const bulletCount = 8;
    const spread = 15;

    const muzzleOffset = 20;
    const muzzleX = effect.startX + Math.cos(effect.angle) * muzzleOffset;
    const muzzleY = effect.startY + Math.sin(effect.angle) * muzzleOffset;

    for (let i = 0; i < bulletCount; i++) {
      const delay = i * 0.12;
      const adjustedProgress = Math.max(
        0,
        Math.min(1, (progress - delay) / (1 / bulletCount)),
      );

      if (adjustedProgress > 0) {
        const bulletDist = 20 + adjustedProgress * effect.range * 1.5;
        const spreadAngle =
          effect.angle + ((i - bulletCount / 2) * spread * Math.PI) / 1800;
        const bulletX = effect.startX + Math.cos(spreadAngle) * bulletDist;
        const bulletY = effect.startY + Math.sin(spreadAngle) * bulletDist;

        graphics.circle(bulletX, bulletY, 8).fill({
          color: 0xffff00,
          alpha: (1 - adjustedProgress * 0.6) * 0.5,
        });

        graphics
          .circle(bulletX, bulletY, 4)
          .fill({ color: 0xff4400, alpha: 1 - adjustedProgress * 0.3 });

        if (adjustedProgress > 0.3) {
          graphics
            .moveTo(muzzleX, muzzleY)
            .lineTo(bulletX, bulletY)
            .stroke({
              width: 2,
              color: 0xffaa00,
              alpha: adjustedProgress * 0.8 * (1 - progress),
            });
        }
      }
    }

    const muzzleSize = 18 + Math.sin(progress * Math.PI * 4) * 5;
    graphics.circle(muzzleX, muzzleY, muzzleSize).fill({
      color: 0xff8800,
      alpha: 0.95 * (1 - progress),
    });

    graphics.circle(muzzleX, muzzleY, muzzleSize * 0.6).fill({
      color: 0xffff00,
      alpha: 1 - progress * 0.3,
    });

    graphics.circle(muzzleX, muzzleY, muzzleSize * 0.3).fill({
      color: 0xffffff,
      alpha: 1,
    });
  }

  public renderSniperEffect(
    graphics: Graphics,
    effect: ShootingEffect,
    progress: number,
  ): void {
    const bulletDist = effect.range * progress * 2.0;
    const bulletX = effect.startX + Math.cos(effect.angle) * bulletDist;
    const bulletY = effect.startY + Math.sin(effect.angle) * bulletDist;

    const muzzleOffset = 20;
    const muzzleX = effect.startX + Math.cos(effect.angle) * muzzleOffset;
    const muzzleY = effect.startY + Math.sin(effect.angle) * muzzleOffset;

    const chargeSize = 30 + Math.sin(progress * Math.PI) * 20;
    graphics.circle(muzzleX, muzzleY, chargeSize).fill({
      color: 0xff0000,
      alpha: 0.3 * (1 - progress),
    });

    graphics.circle(muzzleX, muzzleY, chargeSize * 0.7).fill({
      color: 0xff4400,
      alpha: 0.5 * (1 - progress),
    });

    const explosionSize = 40 + Math.sin(progress * Math.PI * 2) * 15;
    graphics.circle(muzzleX, muzzleY, explosionSize).fill({
      color: 0xff8800,
      alpha: 0.9 * (1 - progress),
    });

    graphics.circle(muzzleX, muzzleY, explosionSize * 0.6).fill({
      color: 0xffff00,
      alpha: 1 - progress * 0.3,
    });

    graphics.circle(muzzleX, muzzleY, explosionSize * 0.3).fill({
      color: 0xffffff,
      alpha: 1,
    });

    const beamWidth = 8 + Math.sin(progress * Math.PI) * 6;
    graphics
      .moveTo(muzzleX, muzzleY)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth,
        color: 0xff0000,
        alpha: (1 - progress * 0.3) * 0.8,
      });

    graphics
      .moveTo(muzzleX, muzzleY)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth * 0.5,
        color: 0xffff00,
        alpha: (1 - progress * 0.5) * 0.6,
      });

    graphics.circle(bulletX, bulletY, 15).fill({
      color: 0xffffff,
      alpha: 1,
    });

    graphics.circle(bulletX, bulletY, 25).fill({
      color: 0xffff00,
      alpha: 0.8 * (1 - progress),
    });

    graphics.circle(bulletX, bulletY, 35).fill({
      color: 0xff4400,
      alpha: 0.6 * (1 - progress),
    });

    const shockwaveSize = bulletDist * 0.3;
    graphics.circle(bulletX, bulletY, shockwaveSize).stroke({
      width: 4,
      color: 0xff0000,
      alpha: 1 - progress,
    });

    graphics.circle(bulletX, bulletY, shockwaveSize * 0.6).stroke({
      width: 3,
      color: 0xffff00,
      alpha: (1 - progress) * 0.8,
    });
  }
}
