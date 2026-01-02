import { Fighter } from "./Fighter";
import { FighterState } from "../types";

export class FighterPhysics {
  private fighter: Fighter;
  velocityX = 0;
  velocityY = 0;

  constructor(fighter: Fighter) {
    this.fighter = fighter;
  }

  update(deltaTime: number): void {
    let dx = 0,
      dy = 0;
    const input = this.fighter.input;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    const dt = deltaTime / 1000;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
      this.velocityX += dx * Fighter.CONFIG.acceleration * dt;
      this.velocityY += dy * Fighter.CONFIG.acceleration * dt;
      if (this.fighter.state !== FighterState.ATTACK)
        this.fighter.state = FighterState.WALK;
    } else {
      if (this.fighter.state !== FighterState.ATTACK)
        this.fighter.state = FighterState.IDLE;
    }

    this.velocityX *= 1 - Fighter.CONFIG.friction * dt;
    this.velocityY *= 1 - Fighter.CONFIG.friction * dt;
    const hasInput = dx !== 0 || dy !== 0;
    const currentSpeed = Math.sqrt(
      this.velocityX * this.velocityX + this.velocityY * this.velocityY,
    );
    const maxSpeed = Fighter.CONFIG.walkSpeed;
    if (hasInput && currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }
    if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    if (Math.abs(this.velocityY) < 1) this.velocityY = 0;
    this.fighter.x += this.velocityX * dt;
    this.fighter.y += this.velocityY * dt;
  }

  reset(): void {
    this.velocityX = 0;
    this.velocityY = 0;
  }
}
