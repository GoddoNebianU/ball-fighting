import { Fighter } from "../fighter/Fighter";
import type { AIState } from "./types";

/** AI状态执行器 */
export class AIStateExecutor {
  private state: AIState = "idle";
  private previousState: AIState = "idle";
  private timer: number = 0;

  public setState(state: AIState): void {
    this.previousState = this.state;
    this.state = state;
  }

  public getState(): AIState {
    return this.state;
  }

  public setTimer(timer: number): void {
    this.timer = timer;
    // 调试: 记录timer设置
    if (timer > 0 && Math.random() < 0.01) {
      console.log(`AIStateExecutor: setTimer to ${timer.toFixed(0)}ms`);
    }
  }

  public getTimer(): number {
    return this.timer;
  }

  public executeState(
    ai: Fighter,
    distance: number,
    dx: number,
    dy: number,
  ): void {
    // 检查状态是否改变
    const stateChanged = this.previousState !== this.state;

    // 调试: 记录状态变化
    if (stateChanged && Math.random() < 0.1) {
      console.log(`AI state: ${this.previousState} -> ${this.state}`);
    }

    switch (this.state) {
      case "approach":
        if (distance > 10) {
          ai.input.up = dy < -10;
          ai.input.down = dy > 10;
          ai.input.left = dx < -10;
          ai.input.right = dx > 10;
        }
        break;

      case "retreat":
        if (distance < 300) {
          ai.input.up = dy > 10;
          ai.input.down = dy < -10;
          ai.input.left = dx > 10;
          ai.input.right = dx < -10;
        }
        break;

      case "strafe":
        // 侧向移动,保持距离但改变位置
        if (Math.abs(dx) > Math.abs(dy)) {
          // 主要在X方向移动,垂直移动
          ai.input.up = dy < -5;
          ai.input.down = dy > 5;
        } else {
          // 主要在Y方向移动,水平移动
          ai.input.left = dx < -5;
          ai.input.right = dx > 5;
        }
        if (this.timer <= 0) {
          this.state = "idle";
        }
        break;

      case "attack_light": {
        // 持续尝试开火,武器内部会检查冷却
        const currentWeapon = ai.currentWeapon;
        const canAttack =
          !ai.combat.isAttacking || ai.combat.cooldownTimer <= 0;

        if (canAttack) {
          if (currentWeapon.canAutoFire()) {
            // 全自动武器(机枪): 持续开火
            ai.startAttack();
          } else if (!ai.combat.isAttacking) {
            // 半自动武器(手枪/拳头): 只在没攻击时开火
            ai.startAttack();
          }
        }
        if (this.timer <= 0) {
          this.state = "idle";
        }
        break;
      }

      case "attack_heavy":
        // 只在状态刚进入时开火一次
        if (stateChanged) {
          // 切换到重拳(索引1)
          const prevIndex = ai.weaponManager.getCurrentWeaponIndex();
          ai.weaponManager.setWeaponIndex(1);
          ai.startAttack();
          ai.weaponManager.setWeaponIndex(prevIndex);
        }
        if (this.timer <= 0) {
          this.state = "idle";
        }
        break;

      case "block":
        ai.input.block = true;
        if (this.timer <= 0) {
          this.state = "idle";
        }
        break;

      case "idle":
        // idle状态什么都不做,等待新决策
        break;

      default:
        console.log(`Unknown AI state: ${this.state}, switching to approach`);
        this.state = "approach";
        break;
    }
  }

  public clearAIInput(ai: Fighter): void {
    ai.input.up = false;
    ai.input.down = false;
    ai.input.left = false;
    ai.input.right = false;
    ai.input.block = false;
  }
}
