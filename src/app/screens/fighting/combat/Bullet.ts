import { Container, Graphics } from "pixi.js";

import { Fighter } from "../fighter/Fighter";

/** 子弹类 */
export class Bullet extends Container {
  public vx: number;
  public vy: number;
  public damage: number;
  public knockback: number;
  public owner: Fighter;
  public lifetime: number = 2000;
  public active: boolean = true;

  private graphics: Graphics;

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    knockback: number,
    owner: Fighter,
  ) {
    super();
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.knockback = knockback;
    this.owner = owner;

    this.graphics = new Graphics();
    this.graphics.circle(0, 0, 6).fill({ color: 0xffff00 });
    this.graphics.circle(0, 0, 4).fill({ color: 0xff0000 });
    this.addChild(this.graphics);
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    const dt = deltaTime / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= deltaTime;

    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  public deactivate(): void {
    this.active = false;
    this.visible = false;
  }
}
