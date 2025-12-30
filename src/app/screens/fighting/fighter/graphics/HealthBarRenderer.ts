import { Graphics } from "pixi.js";

/** 血条渲染器 */
export class HealthBarRenderer {
  private graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public initBackground(): void {
    // 血条背景
    this.graphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
  }

  public update(health: number, maxHealth: number): void {
    const healthPercent = health / maxHealth;
    this.graphics.clear();
    this.graphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.graphics.roundRect(-29, -49, 58 * healthPercent, 6, 3).fill({
      color:
        healthPercent > 0.5
          ? 0x00ff00
          : healthPercent > 0.25
            ? 0xffff00
            : 0xff0000,
    });
  }
}
