import { Graphics } from "pixi.js";
import { Fighter } from "./Fighter";
import { FighterState } from "../types";

/** 角色动画系统 */
export class FighterAnimation {
  private fighter: Fighter;
  private bodyGraphics: Graphics;
  private healthBarGraphics: Graphics;

  constructor(
    fighter: Fighter,
    bodyGraphics: Graphics,
    healthBarGraphics: Graphics,
  ) {
    this.fighter = fighter;
    this.bodyGraphics = bodyGraphics;
    this.healthBarGraphics = healthBarGraphics;
  }

  public update(): void {
    this.updateHealthBar();
    this.updateBodyAnimation();
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
}
