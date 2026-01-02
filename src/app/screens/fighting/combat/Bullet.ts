import { Container, Graphics } from "pixi.js";
import { Fighter } from "../fighter/Fighter";

export class Bullet extends Container {
  vx: number;
  vy: number;
  damage: number;
  knockback: number;
  owner: Fighter;
  lifetime = 2000;
  active = true;
  penetrating = false;

  private graphics: Graphics;
  private hitTargets: Set<Fighter> = new Set();

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    knockback: number,
    owner: Fighter,
    penetrating = false,
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

  update(deltaTime: number): void {
    if (!this.active) return;
    const dt = deltaTime / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) this.active = false;
  }

  deactivate(): void {
    this.active = false;
    this.visible = false;
  }

  hasHit(target: Fighter): boolean {
    return this.hitTargets.has(target);
  }
  markHit(target: Fighter): void {
    this.hitTargets.add(target);
  }
}
