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
  public penetrating: boolean = false; // 是否穿透

  private graphics: Graphics;
  private hitTargets: Set<Fighter> = new Set(); // 已击中的目标（穿透子弹用）

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    knockback: number,
    owner: Fighter,
    penetrating: boolean = false,
  ) {
    super();
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.knockback = knockback;
    this.owner = owner;
    this.penetrating = penetrating;

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

  /** 检查是否已击中该目标 */
  public hasHit(target: Fighter): boolean {
    return this.hitTargets.has(target);
  }

  /** 标记已击中该目标 */
  public markHit(target: Fighter): void {
    this.hitTargets.add(target);
  }
}
