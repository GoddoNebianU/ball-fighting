import { Fighter } from "./Fighter";
import { FighterState } from "../types";

/** 物理系统 */
export class FighterPhysics {
  private fighter: Fighter;

  public velocityX: number = 0;
  public velocityY: number = 0;

  constructor(fighter: Fighter) {
    this.fighter = fighter;
  }

  public update(deltaTime: number): void {
    let dx = 0;
    let dy = 0;

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

      // 应用加速度
      this.velocityX += dx * Fighter.CONFIG.acceleration * dt;
      this.velocityY += dy * Fighter.CONFIG.acceleration * dt;

      // 只有在不攻击时才能改变state为WALK
      if (this.fighter.state !== FighterState.ATTACK) {
        this.fighter.state = FighterState.WALK;
      }
    } else {
      // 只有在不攻击时才能改变state为IDLE
      if (this.fighter.state !== FighterState.ATTACK) {
        this.fighter.state = FighterState.IDLE;
      }
    }

    // 应用摩擦力
    this.velocityX *= 1 - Fighter.CONFIG.friction * dt;
    this.velocityY *= 1 - Fighter.CONFIG.friction * dt;

    // 只限制移动输入产生的速度,不限制击退速度
    // 检查是否有玩家输入
    const hasInput = dx !== 0 || dy !== 0;

    // 限制最大速度 - 只在玩家主动移动时限制
    const currentSpeed = Math.sqrt(
      this.velocityX * this.velocityX + this.velocityY * this.velocityY,
    );
    const maxSpeed = Fighter.CONFIG.walkSpeed;
    if (hasInput && currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }

    // 当速度很小时归零
    if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    if (Math.abs(this.velocityY) < 1) this.velocityY = 0;

    // 更新位置
    this.fighter.x += this.velocityX * dt;
    this.fighter.y += this.velocityY * dt;
  }

  public reset(): void {
    this.velocityX = 0;
    this.velocityY = 0;
  }
}
