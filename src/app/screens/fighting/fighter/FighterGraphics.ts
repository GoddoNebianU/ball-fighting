import { Container, Graphics } from "pixi.js";

import { Fighter } from "./Fighter";
import { FighterState } from "../types";

/** 渲染系统 */
export class FighterGraphics {
  private fighter: Fighter;
  public readonly container: Container;

  private bodyGraphics: Graphics;
  private weaponGraphics: Graphics;
  private shadowGraphics: Graphics;
  private healthBarGraphics: Graphics;

  constructor(fighter: Fighter, color: number) {
    this.fighter = fighter;

    this.container = new Container();
    this.bodyGraphics = new Graphics();
    this.weaponGraphics = new Graphics();
    this.shadowGraphics = new Graphics();
    this.healthBarGraphics = new Graphics();

    this.initCharacter(color);
    this.container.addChild(
      this.shadowGraphics,
      this.bodyGraphics,
      this.weaponGraphics,
      this.healthBarGraphics,
    );
  }

  private initCharacter(color: number): void {
    // 阴影
    this.shadowGraphics
      .circle(0, 0, Fighter.CONFIG.radius)
      .fill({ color: 0x000000, alpha: 0.2 });

    // 身体
    this.bodyGraphics.circle(0, 0, Fighter.CONFIG.radius).fill({ color });
    this.bodyGraphics
      .circle(0, 0, Fighter.CONFIG.radius - 3)
      .stroke({ width: 2, color: 0x000000, alpha: 0.3 });

    // 眼睛
    this.bodyGraphics.circle(Fighter.CONFIG.radius / 2, 0, 5).fill({
      color: 0x000000,
    });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius / 2 - 3, -3, 3)
      .fill({ color: 0xffffff });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius / 2 - 3, 3, 3)
      .fill({ color: 0xffffff });

    // 手臂
    this.bodyGraphics
      .circle(-Fighter.CONFIG.radius + 5, 0, 8)
      .fill({ color: color - 0x222222 });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius - 5, 0, 8)
      .fill({ color: color - 0x222222 });

    // 血条背景
    this.healthBarGraphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
  }

  public update(): void {
    this.updateHealthBar();
    this.updateBodyAnimation();
    this.updateAttackEffect();
  }

  private updateHealthBar(): void {
    const healthPercent = this.fighter.health / Fighter.CONFIG.maxHealth;
    this.healthBarGraphics.clear();
    this.healthBarGraphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.healthBarGraphics.roundRect(-29, -49, 58 * healthPercent, 6, 3).fill({
      color:
        healthPercent > 0.5
          ? 0x00ff00
          : healthPercent > 0.25
            ? 0xffff00
            : 0xff0000,
    });
  }

  private updateBodyAnimation(): void {
    const bobOffset =
      this.fighter.state === FighterState.WALK
        ? Math.sin(Date.now() / 100) * 2
        : 0;
    this.bodyGraphics.y = bobOffset;

    if (this.fighter.state === FighterState.HIT) {
      // 受击时的剧烈闪烁效果
      this.bodyGraphics.alpha = 0.3 + Math.sin(Date.now() / 30) * 0.7;
      // 受击时的剧烈震动效果
      const shakeIntensity = 6;
      this.bodyGraphics.x = (Math.random() - 0.5) * shakeIntensity;
      this.bodyGraphics.y = bobOffset + (Math.random() - 0.5) * shakeIntensity;
      // 受击时的快速缩放效果
      const scale = 1 + Math.sin(Date.now() / 20) * 0.2;
      this.bodyGraphics.scale.set(scale);
      // 旋转效果 - 让角色看起来被打得晕头转向
      this.bodyGraphics.rotation = (Math.random() - 0.5) * 0.3;
    } else {
      this.bodyGraphics.alpha = 1;
      this.bodyGraphics.x = 0;
      this.bodyGraphics.scale.set(1);
      this.bodyGraphics.rotation = 0;
    }
  }

  private updateAttackEffect(): void {
    if (
      this.fighter.state === FighterState.ATTACK &&
      this.fighter.currentAttack
    ) {
      const weaponData = this.fighter.currentWeapon.getData();

      // 只为近战武器绘制攻击效果，枪械特效由EffectManager处理
      if (!weaponData.projectile) {
        const progress =
          1 - this.fighter.combat.attackTimer / weaponData.duration;
        this.drawAttackEffect(progress);
      } else {
        // 枪械攻击不在这里绘制特效
        this.weaponGraphics.clear();
      }
    } else if (this.fighter.state === FighterState.BLOCK) {
      this.drawBlockEffect();
    } else if (
      this.fighter.state === FighterState.IDLE ||
      this.fighter.state === FighterState.WALK
    ) {
      this.drawWeapon();
    } else {
      this.weaponGraphics.clear();
    }
  }

  private drawWeapon(): void {
    this.weaponGraphics.clear();

    // 武器放在角色右侧（因为角色会旋转）
    const weaponDist = Fighter.CONFIG.radius - 5;
    const weaponX = weaponDist;
    const weaponY = 0;

    const weaponName = this.fighter.currentWeapon.getName();

    if (weaponName === "手枪") {
      // 手枪: 黑色枪身
      this.weaponGraphics
        .roundRect(weaponX - 3, weaponY - 8, 6, 16, 2)
        .fill({ color: 0x333333 });
      this.weaponGraphics
        .circle(weaponX, weaponY - 5, 3)
        .fill({ color: 0x444444 });
    } else if (weaponName === "机枪") {
      // 机枪: 更长更大的枪身,深灰色
      this.weaponGraphics
        .roundRect(weaponX - 4, weaponY - 10, 8, 22, 2)
        .fill({ color: 0x2a2a2a });
      this.weaponGraphics
        .roundRect(weaponX - 2, weaponY - 8, 4, 12, 1)
        .fill({ color: 0x1a1a1a });
      // 弹匣
      this.weaponGraphics
        .roundRect(weaponX - 3, weaponY + 5, 6, 8, 1)
        .fill({ color: 0x3a3a3a });
    } else if (weaponName === "狙击枪") {
      // 狙击枪: 超长的枪管,战术风格
      // 主枪身 - 深绿色
      this.weaponGraphics
        .roundRect(weaponX - 5, weaponY - 12, 10, 28, 2)
        .fill({ color: 0x1a2a1a });

      // 枪管 - 更长更细
      this.weaponGraphics
        .roundRect(weaponX - 2, weaponY - 25, 4, 15, 1)
        .fill({ color: 0x0f1a0f });

      // 瞄准镜 - 粗壮的瞄准镜座
      this.weaponGraphics
        .roundRect(weaponX - 6, weaponY - 18, 12, 4, 1)
        .fill({ color: 0x2a3a2a });

      // 瞄准镜主体
      this.weaponGraphics
        .roundRect(weaponX - 4, weaponY - 22, 8, 6, 2)
        .fill({ color: 0x3a4a3a });

      // 瞄准镜镜头
      this.weaponGraphics
        .circle(weaponX, weaponY - 20, 2)
        .fill({ color: 0x00ffff, alpha: 0.8 });

      // 枪托
      this.weaponGraphics
        .roundRect(weaponX - 4, weaponY + 8, 8, 10, 2)
        .fill({ color: 0x2a3a2a });

      // 弹匣 - 狙击枪的单发弹匣很小
      this.weaponGraphics
        .roundRect(weaponX - 2, weaponY + 10, 4, 4, 1)
        .fill({ color: 0x1a2a1a });

      // 战术细节 - 枪身上的纹路
      this.weaponGraphics
        .rect(weaponX - 3, weaponY - 8, 6, 12)
        .stroke({ width: 1, color: 0x0f1a0f, alpha: 0.5 });
    } else if (weaponName === "重拳") {
      // 重拳: 红色光晕
      this.weaponGraphics
        .circle(weaponX, weaponY, 12)
        .fill({ color: 0xff0000, alpha: 0.3 });
    }
    // 轻拳不显示武器
  }

  private drawAttackEffect(progress: number): void {
    this.weaponGraphics.clear();

    const currentWeapon = this.fighter.currentWeapon;
    const weaponData = currentWeapon.getData();
    const weaponName = currentWeapon.getName();

    const range = weaponData.range;
    // 攻击始终向右(Fighter 容器的前方),因为容器已经旋转了
    const attackDist =
      Fighter.CONFIG.radius + Math.sin(progress * Math.PI) * range;
    const attackX = attackDist;
    const attackY = 0;

    if (weaponName === "轻拳") {
      // 轻拳: 黄色拳风
      this.weaponGraphics
        .circle(attackX, attackY, 12)
        .fill({ color: 0xffaa00 });
    } else if (weaponName === "重拳") {
      // 重拳: 大红色冲击波
      const impactSize = 15 + Math.sin(progress * Math.PI) * 20;
      this.weaponGraphics.circle(attackX, attackY, impactSize).fill({
        color: 0xff4400,
        alpha: 0.7,
      });
      this.weaponGraphics
        .circle(attackDist + 10, 0, 10)
        .fill({ color: 0xffaa00 });
    } else if (weaponName === "手枪") {
      // 手枪: 枪口火焰和子弹轨迹
      const bulletDist = range * progress * 1.5;
      const bulletX = bulletDist;
      const bulletY = 0;

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, 15)
        .fill({ color: 0xffff00, alpha: 0.8 });

      this.weaponGraphics
        .circle(bulletX, bulletY, 8)
        .fill({ color: 0xff0000, alpha: 0.9 });

      this.weaponGraphics
        .moveTo(Fighter.CONFIG.radius, 0)
        .lineTo(bulletX, bulletY)
        .stroke({ width: 3, color: 0xffaa00, alpha: 0.6 });
    } else if (weaponName === "机枪") {
      // 机枪: 疯狂的子弹风暴!
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
          this.weaponGraphics.circle(bulletX, bulletY, 8).fill({
            color: 0xffff00,
            alpha: (1 - adjustedProgress * 0.6) * 0.5,
          });

          // 子弹核心
          this.weaponGraphics
            .circle(bulletX, bulletY, 4)
            .fill({ color: 0xff4400, alpha: 1 - adjustedProgress * 0.3 });

          // 子弹轨迹线
          if (adjustedProgress > 0.3) {
            this.weaponGraphics
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
      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, muzzleSize)
        .fill({ color: 0xff8800, alpha: 0.95 });

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, muzzleSize * 0.6)
        .fill({ color: 0xffff00, alpha: 1 });

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, muzzleSize * 0.3)
        .fill({ color: 0xffffff, alpha: 1 });
    } else if (weaponName === "狙击枪") {
      // 狙击枪: 超级爆炸的视觉效果!
      const bulletDist = range * progress * 2.0;
      const bulletX = bulletDist;
      const bulletY = 0;

      // 巨大的能量聚集光环
      const chargeSize = 30 + Math.sin(progress * Math.PI) * 20;
      this.weaponGraphics.circle(Fighter.CONFIG.radius, 0, chargeSize).fill({
        color: 0xff0000,
        alpha: 0.3 * (1 - progress),
      });

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, chargeSize * 0.7)
        .fill({
          color: 0xff4400,
          alpha: 0.5 * (1 - progress),
        });

      // 超级巨大的枪口爆炸
      const explosionSize = 40 + Math.sin(progress * Math.PI * 2) * 15;
      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, explosionSize)
        .fill({ color: 0xff8800, alpha: 0.9 });

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, explosionSize * 0.6)
        .fill({ color: 0xffff00, alpha: 1 });

      this.weaponGraphics
        .circle(Fighter.CONFIG.radius, 0, explosionSize * 0.3)
        .fill({ color: 0xffffff, alpha: 1 });

      // 超级粗的激光束
      const beamWidth = 8 + Math.sin(progress * Math.PI) * 6;
      this.weaponGraphics
        .moveTo(Fighter.CONFIG.radius, 0)
        .lineTo(bulletX, bulletY)
        .stroke({
          width: beamWidth,
          color: 0xff0000,
          alpha: 1 - progress * 0.3,
        });

      this.weaponGraphics
        .moveTo(Fighter.CONFIG.radius, 0)
        .lineTo(bulletX, bulletY)
        .stroke({
          width: beamWidth * 0.5,
          color: 0xffff00,
          alpha: 1 - progress * 0.5,
        });

      // 巨大的发光子弹核心
      this.weaponGraphics.circle(bulletX, bulletY, 15).fill({
        color: 0xffffff,
        alpha: 1,
      });

      this.weaponGraphics.circle(bulletX, bulletY, 25).fill({
        color: 0xffff00,
        alpha: 0.8,
      });

      this.weaponGraphics.circle(bulletX, bulletY, 35).fill({
        color: 0xff4400,
        alpha: 0.6,
      });

      // 冲击波效果
      const shockwaveSize = bulletDist * 0.3;
      this.weaponGraphics
        .circle(bulletX, bulletY, shockwaveSize)
        .stroke({ width: 4, color: 0xff0000, alpha: 1 - progress });

      this.weaponGraphics
        .circle(bulletX, bulletY, shockwaveSize * 0.6)
        .stroke({ width: 3, color: 0xffff00, alpha: 1 - progress });
    }
  }

  private drawBlockEffect(): void {
    this.weaponGraphics.clear();
    this.weaponGraphics
      .circle(0, 0, Fighter.CONFIG.radius + 10)
      .stroke({ width: 4, color: 0x00ffff, alpha: 0.7 });
    this.weaponGraphics
      .circle(0, 0, Fighter.CONFIG.radius + 5)
      .fill({ color: 0x00ffff, alpha: 0.1 });
  }
}
