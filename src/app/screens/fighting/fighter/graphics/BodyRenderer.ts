import { Graphics } from "pixi.js";
import { FighterState } from "../../types";

/** 身体渲染器 */
export class BodyRenderer {
  private graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public initCharacter(color: number, radius: number): void {
    // 阴影
    this.graphics.circle(0, 0, radius).fill({ color: 0x000000, alpha: 0.2 });

    // 身体
    this.graphics.circle(0, 0, radius).fill({ color });
    this.graphics
      .circle(0, 0, radius - 3)
      .stroke({ width: 2, color: 0x000000, alpha: 0.3 });

    // 眼睛
    this.graphics.circle(radius / 2, 0, 5).fill({ color: 0x000000 });
    this.graphics.circle(radius / 2 - 3, -3, 3).fill({ color: 0xffffff });
    this.graphics.circle(radius / 2 - 3, 3, 3).fill({ color: 0xffffff });

    // 手臂
    this.graphics.circle(-radius + 5, 0, 8).fill({ color: color - 0x222222 });
    this.graphics.circle(radius - 5, 0, 8).fill({ color: color - 0x222222 });
  }

  public updateAnimation(state: FighterState): void {
    const bobOffset =
      state === FighterState.WALK ? Math.sin(Date.now() / 100) * 2 : 0;
    this.graphics.y = bobOffset;

    if (state === FighterState.HIT) {
      // HIT - 受击时的剧烈闪烁效果
      this.graphics.alpha = 0.3 + Math.sin(Date.now() / 30) * 0.7;
      // 受击时的剧烈震动效果
      const shakeIntensity = 6;
      this.graphics.x = (Math.random() - 0.5) * shakeIntensity;
      this.graphics.y = bobOffset + (Math.random() - 0.5) * shakeIntensity;
      // 受击时的快速缩放效果
      const scale = 1 + Math.sin(Date.now() / 20) * 0.2;
      this.graphics.scale.set(scale);
      // 旋转效果 - 让角色看起来被打得晕头转向
      this.graphics.rotation = (Math.random() - 0.5) * 0.3;
    } else {
      this.graphics.alpha = 1;
      this.graphics.x = 0;
      this.graphics.scale.set(1);
      this.graphics.rotation = 0;
    }
  }
}
