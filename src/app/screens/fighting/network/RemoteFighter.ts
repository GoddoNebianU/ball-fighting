import { Fighter } from "../fighter/Fighter";
import type { PlayerState } from "./types";
import { FighterState } from "../types";

/**
 * 远程玩家 - 直接继承 Fighter，复用完整的渲染和游戏系统
 * 多人模式中的其他玩家本质上是 Fighter，只是状态由服务器控制
 */
export class RemoteFighter extends Fighter {
  private targetPosition: { x: number; y: number };
  private targetRotation: number;
  private readonly LERP_FACTOR = 0.2;

  constructor(state: PlayerState) {
    // 创建 Fighter，使用默认武器
    super(state.color, []);

    // 同步初始状态
    this.id = state.id;
    this.name = state.name;
    this.health = state.health;
    this.isDead = state.isDead;

    this.x = state.position.x;
    this.y = state.position.y;
    this.attackAngle = state.rotation;

    this.targetPosition = { ...state.position };
    this.targetRotation = state.rotation;

    console.log(
      `[RemoteFighter] Created: name=${this.name}, pos=(${this.x},${this.y}), visible=${this.visible}, children=${this.children.length}, graphics.container.children=${this.graphics.container.children.length}`,
    );
  }

  syncState(state: PlayerState): void {
    this.targetPosition = { ...state.position };
    this.targetRotation = state.rotation;
    this.health = state.health;
    this.isDead = state.isDead;

    // 将服务器状态映射到 FighterState
    const stateMap: Record<string, FighterState> = {
      idle: FighterState.IDLE,
      walk: FighterState.WALK,
      attack: FighterState.ATTACK,
      block: FighterState.BLOCK,
      hit: FighterState.HIT,
    };
    this.state = stateMap[state.state] || FighterState.IDLE;
  }

  updateInterpolation(): void {
    if (this.isDead) {
      this.visible = false;
      return;
    }
    this.visible = true;

    // 位置插值
    const dx = this.targetPosition.x - this.x;
    const dy = this.targetPosition.y - this.y;

    this.x += dx * this.LERP_FACTOR;
    this.y += dy * this.LERP_FACTOR;

    // 旋转插值
    let rotDiff = this.targetRotation - this.attackAngle;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    this.attackAngle += rotDiff * this.LERP_FACTOR;

    // 更新 Fighter 的渲染系统
    this.graphics.update();
  }

  takeDamageVisual(): void {
    this.state = FighterState.HIT;
    setTimeout(() => {
      if (!this.isDead) {
        this.state = FighterState.IDLE;
      }
    }, 200);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getRotation(): number {
    return this.attackAngle;
  }
}
