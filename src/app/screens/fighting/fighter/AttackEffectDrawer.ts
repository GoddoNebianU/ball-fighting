import { Graphics } from "pixi.js";
import { Fighter } from "./Fighter";

/** 攻击特效绘制器 */
export class AttackEffectDrawer {
  static drawAttackEffect(
    weaponGraphics: Graphics,
    fighter: Fighter,
    progress: number,
  ): void {
    weaponGraphics.clear();

    const currentWeapon = fighter.currentWeapon;
    const weaponData = currentWeapon.getData();
    const weaponName = currentWeapon.getName();

    const range = weaponData.range;
    // 攻击始终向右(Fighter 容器的前方),因为容器已经旋转了
    const attackDist =
      Fighter.CONFIG.radius + Math.sin(progress * Math.PI) * range;
    const attackX = attackDist;
    const attackY = 0;

    if (weaponName === "轻拳") {
      AttackEffectDrawer.drawMeleeAttack(
        weaponGraphics,
        attackX,
        attackY,
        0xffaa00,
        12,
      );
    } else if (weaponName === "重拳") {
      AttackEffectDrawer.drawHeavyAttack(weaponGraphics, attackDist, progress);
    } else if (weaponName === "手枪") {
      AttackEffectDrawer.drawPistolEffect(weaponGraphics, range, progress);
    } else if (weaponName === "机枪") {
      AttackEffectDrawer.drawMachineGunEffect(weaponGraphics, range, progress);
    } else if (weaponName === "狙击枪") {
      AttackEffectDrawer.drawSniperEffect(weaponGraphics, range, progress);
    }
  }

  private static drawMeleeAttack(
    weaponGraphics: Graphics,
    x: number,
    y: number,
    color: number,
    size: number,
  ): void {
    weaponGraphics.circle(x, y, size).fill({ color });
  }

  private static drawHeavyAttack(
    weaponGraphics: Graphics,
    attackDist: number,
    progress: number,
  ): void {
    const impactSize = 15 + Math.sin(progress * Math.PI) * 20;
    weaponGraphics.circle(attackDist, 0, impactSize).fill({
      color: 0xff4400,
      alpha: 0.7,
    });
    weaponGraphics.circle(attackDist + 10, 0, 10).fill({ color: 0xffaa00 });
  }

  private static drawPistolEffect(
    weaponGraphics: Graphics,
    range: number,
    progress: number,
  ): void {
    const bulletDist = range * progress * 1.5;
    const bulletX = bulletDist;
    const bulletY = 0;

    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, 15)
      .fill({ color: 0xffff00, alpha: 0.8 });

    weaponGraphics.circle(bulletX, bulletY, 8).fill({
      color: 0xff0000,
      alpha: 0.9,
    });

    weaponGraphics
      .moveTo(Fighter.CONFIG.radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({ width: 3, color: 0xffaa00, alpha: 0.6 });
  }

  private static drawMachineGunEffect(
    weaponGraphics: Graphics,
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
        const bulletDist =
          Fighter.CONFIG.radius + adjustedProgress * range * 1.5;
        const bulletX = bulletDist;
        const bulletY = (i - bulletCount / 2) * spread * adjustedProgress;

        // 子弹光晕
        weaponGraphics.circle(bulletX, bulletY, 8).fill({
          color: 0xffff00,
          alpha: (1 - adjustedProgress * 0.6) * 0.5,
        });

        // 子弹核心
        weaponGraphics
          .circle(bulletX, bulletY, 4)
          .fill({ color: 0xff4400, alpha: 1 - adjustedProgress * 0.3 });

        // 子弹轨迹线
        if (adjustedProgress > 0.3) {
          weaponGraphics
            .moveTo(Fighter.CONFIG.radius, 0)
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
    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, muzzleSize)
      .fill({ color: 0xff8800, alpha: 0.95 });

    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, muzzleSize * 0.6)
      .fill({ color: 0xffff00, alpha: 1 });

    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, muzzleSize * 0.3)
      .fill({ color: 0xffffff, alpha: 1 });
  }

  private static drawSniperEffect(
    weaponGraphics: Graphics,
    range: number,
    progress: number,
  ): void {
    const bulletDist = range * progress * 2.0;
    const bulletX = bulletDist;
    const bulletY = 0;

    // 巨大的能量聚集光环
    const chargeSize = 30 + Math.sin(progress * Math.PI) * 20;
    weaponGraphics.circle(Fighter.CONFIG.radius, 0, chargeSize).fill({
      color: 0xff0000,
      alpha: 0.3 * (1 - progress),
    });

    weaponGraphics.circle(Fighter.CONFIG.radius, 0, chargeSize * 0.7).fill({
      color: 0xff4400,
      alpha: 0.5 * (1 - progress),
    });

    // 超级巨大的枪口爆炸
    const explosionSize = 40 + Math.sin(progress * Math.PI * 2) * 15;
    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, explosionSize)
      .fill({ color: 0xff8800, alpha: 0.9 });

    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, explosionSize * 0.6)
      .fill({ color: 0xffff00, alpha: 1 });

    weaponGraphics
      .circle(Fighter.CONFIG.radius, 0, explosionSize * 0.3)
      .fill({ color: 0xffffff, alpha: 1 });

    // 超级粗的激光束
    const beamWidth = 8 + Math.sin(progress * Math.PI) * 6;
    weaponGraphics
      .moveTo(Fighter.CONFIG.radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth,
        color: 0xff0000,
        alpha: 1 - progress * 0.3,
      });

    weaponGraphics
      .moveTo(Fighter.CONFIG.radius, 0)
      .lineTo(bulletX, bulletY)
      .stroke({
        width: beamWidth * 0.5,
        color: 0xffff00,
        alpha: 1 - progress * 0.5,
      });

    // 巨大的发光子弹核心
    weaponGraphics.circle(bulletX, bulletY, 15).fill({
      color: 0xffffff,
      alpha: 1,
    });

    weaponGraphics.circle(bulletX, bulletY, 25).fill({
      color: 0xffff00,
      alpha: 0.8,
    });

    weaponGraphics.circle(bulletX, bulletY, 35).fill({
      color: 0xff4400,
      alpha: 0.6,
    });

    // 冲击波效果
    const shockwaveSize = bulletDist * 0.3;
    weaponGraphics
      .circle(bulletX, bulletY, shockwaveSize)
      .stroke({ width: 4, color: 0xff0000, alpha: 1 - progress });

    weaponGraphics
      .circle(bulletX, bulletY, shockwaveSize * 0.6)
      .stroke({ width: 3, color: 0xffff00, alpha: 1 - progress });
  }
}
