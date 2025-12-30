import { Container, Graphics } from "pixi.js";

/** 血包类 */
export class HealthPack extends Container {
  public healAmount: number = 20;
  public active: boolean = true;
  public lifetime: number = 8000; // 8秒后消失

  private graphics: Graphics;
  private pulseTime: number = 0;

  constructor() {
    super();

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.draw();
  }

  private draw(): void {
    this.graphics.clear();

    // 外圈十字
    this.graphics.circle(0, 0, 15).fill({ color: 0xff0000, alpha: 0.3 });

    // 十字形状
    const crossSize = 10;
    const crossWidth = 6;

    // 竖线
    this.graphics
      .roundRect(-crossWidth / 2, -crossSize, crossWidth, crossSize * 2, 2)
      .fill({ color: 0xff0000 });

    // 横线
    this.graphics
      .roundRect(-crossSize, -crossWidth / 2, crossSize * 2, crossWidth, 2)
      .fill({ color: 0xff0000 });

    // 内圈高光
    this.graphics.circle(0, 0, 5).fill({ color: 0xffffff, alpha: 0.5 });
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
      this.visible = false;
      return;
    }

    // 脉冲动画
    this.pulseTime += deltaTime;
    const scale = 1 + Math.sin(this.pulseTime / 200) * 0.1;
    this.scale.set(scale);

    // 快消失时闪烁
    if (this.lifetime < 2000) {
      this.alpha = Math.floor(this.pulseTime / 100) % 2 === 0 ? 1 : 0.3;
    }
  }
}
