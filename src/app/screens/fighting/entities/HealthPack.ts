import { Container, Graphics } from "pixi.js";

export class HealthPack extends Container {
  healAmount = 20;
  active = true;
  lifetime = 8000;
  private graphics: Graphics;
  private pulseTime = 0;

  constructor() {
    super();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this.draw();
  }

  private draw(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, 15).fill({ color: 0xff0000, alpha: 0.3 });
    const crossSize = 10,
      crossWidth = 6;
    this.graphics
      .roundRect(-crossWidth / 2, -crossSize, crossWidth, crossSize * 2, 2)
      .fill({ color: 0xff0000 });
    this.graphics
      .roundRect(-crossSize, -crossWidth / 2, crossSize * 2, crossWidth, 2)
      .fill({ color: 0xff0000 });
    this.graphics.circle(0, 0, 5).fill({ color: 0xffffff, alpha: 0.5 });
  }

  update(deltaTime: number): void {
    if (!this.active) return;
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
      this.visible = false;
      return;
    }
    this.pulseTime += deltaTime;
    const scale = 1 + Math.sin(this.pulseTime / 200) * 0.1;
    this.scale.set(scale);
    if (this.lifetime < 2000)
      this.alpha = Math.floor(this.pulseTime / 100) % 2 === 0 ? 1 : 0.3;
  }
}
