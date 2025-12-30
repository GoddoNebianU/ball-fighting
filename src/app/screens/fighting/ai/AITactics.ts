import { Fighter } from "../fighter/Fighter";
import type { AIState } from "./types";

/** AI战术决策 */
export class AITactics {
  constructor(
    private state: AIState,
    private timer: number,
    private targetDistance: number,
    private aggressiveness: number,
    private reactionDelay: number,
  ) {}

  public getState(): AIState {
    return this.state;
  }

  public setState(state: AIState): void {
    this.state = state;
  }

  public getTimer(): number {
    return this.timer;
  }

  public setTimer(timer: number): void {
    this.timer = timer;
  }

  public getTargetDistance(): number {
    return this.targetDistance;
  }

  public setTargetDistance(distance: number): void {
    this.targetDistance = distance;
  }

  public getReactionDelay(): number {
    return this.reactionDelay;
  }

  public setReactionDelay(delay: number): void {
    this.reactionDelay = delay;
  }

  /** 根据武器和距离做出战术决策 */
  public makeTacticalDecision(distance: number, ai: Fighter): void {
    const rand = Math.random();

    // 调试: 记录决策调用
    console.log(
      `[AITactics] makeTacticalDecision - distance: ${distance.toFixed(0)}, weapon: ${ai.currentWeapon.getName()}`,
    );

    // 根据血量决定策略
    const aiHealthPercent = ai.health / Fighter.CONFIG.maxHealth;
    // 注意: 这里暂时用自身血量作为对比,后续可以传入对手血量
    const playerHealthPercent = aiHealthPercent;

    if (aiHealthPercent < 0.3) {
      this.aggressiveness = 0.3;
      this.targetDistance = 200;
    } else if (aiHealthPercent > playerHealthPercent) {
      this.aggressiveness = 0.8;
      this.targetDistance = 80;
    } else {
      this.aggressiveness = 0.6;
      this.targetDistance = 100;
    }

    // 保存之前的状态
    const previousState = this.state;

    // 根据武器类型选择战术
    const weaponName = ai.currentWeapon.getName();

    if (weaponName === "手枪") {
      this.decidePistolTactics(distance, rand);
    } else if (weaponName === "机枪") {
      this.decideMachineGunTactics(distance, rand);
    } else if (weaponName === "狙击枪") {
      this.decideSniperTactics(distance, rand);
    } else {
      this.decideMeleeTactics(distance, rand);
    }

    // 设置反应延时
    this.updateReactionDelay(previousState);
  }

  private decidePistolTactics(distance: number, rand: number): void {
    if (distance < 150) {
      // 太近了,后退保持距离
      this.state = "retreat";
      this.timer = 600;
    } else if (distance > 350) {
      // 太远了,稍微靠近一点
      this.state = "approach";
      this.timer = 600;
    } else if (rand < 0.5) {
      // 在最佳射程内,开火! 提高开火概率到50%
      this.state = "attack_light";
      this.timer = 800;
    } else {
      // 偶尔侧向移动
      this.state = "strafe";
      this.timer = 600;
    }
  }

  private decideMachineGunTactics(distance: number, rand: number): void {
    if (distance < 200) {
      // 太近了,后退保持距离
      this.state = "retreat";
      this.timer = 500;
    } else if (distance > 400) {
      // 太远了,稍微靠近一点
      this.state = "approach";
      this.timer = 500;
    } else if (rand < 0.7) {
      // 机枪疯狂开火! 提高开火概率到70%
      this.state = "attack_light";
      this.timer = 800; // 延长开火持续时间
    } else {
      // 偶尔侧向移动
      this.state = "strafe";
      this.timer = 400;
    }
  }

  private decideSniperTactics(distance: number, rand: number): void {
    if (distance < 300) {
      // 太近了,后退保持距离
      this.state = "retreat";
      this.timer = 400;
    } else if (rand < 0.6) {
      // 狙击枪在最佳距离开火
      this.state = "attack_light";
      this.timer = 1000;
    } else {
      // 侧向移动寻找最佳射击角度
      this.state = "strafe";
      this.timer = 500;
    }
  }

  private decideMeleeTactics(distance: number, rand: number): void {
    if (distance > this.targetDistance + 50) {
      // 太远了,靠近
      this.state = "approach";
    } else if (distance < this.targetDistance - 30) {
      // 太近了,后退拉开距离
      this.state = "retreat";
    } else if (rand < this.aggressiveness + 0.3) {
      // 在最佳距离,攻击
      const attackChoice = Math.random();
      if (attackChoice < 0.65) {
        this.state = "attack_light";
      } else {
        this.state = "attack_heavy";
      }
      this.timer = 250;
    } else if (rand < this.aggressiveness + 0.5) {
      this.state = "block";
      this.timer = 200;
    } else {
      // 随机移动,保持距离
      this.state = Math.random() < 0.5 ? "approach" : "retreat";
    }
  }

  private updateReactionDelay(previousState: AIState): void {
    if (this.state !== previousState) {
      if (this.state === "approach") {
        this.reactionDelay = 50 + Math.random() * 50;
      } else if (this.state.startsWith("attack")) {
        this.reactionDelay = 100 + Math.random() * 150;
      } else {
        this.reactionDelay = 150 + Math.random() * 200;
      }
    }
  }
}
