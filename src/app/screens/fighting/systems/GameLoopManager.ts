/**
 * 游戏循环管理器
 * 处理游戏更新、AI、子弹、特效、血包更新
 */

import { PlayerManager } from "../entities/PlayerManager";
import { GameAI } from "../ai/GameAI";
import { BulletManager } from "../combat/BulletManager";
import { EffectManager } from "../combat/EffectManager";
import { HealthPackManager } from "../entities/HealthPackManager";
import { GameUI } from "../ui/GameUI";

export class GameLoopManager {
  private lastTime: number = 0;

  constructor(
    private ui: GameUI,
    private ai: GameAI,
    private players: PlayerManager,
    private bullets: BulletManager,
    private effectManager: EffectManager,
    private healthPacks: HealthPackManager,
  ) {}

  public update(currentTime: number): void {
    const deltaTime = this.lastTime ? currentTime - this.lastTime : 16;
    this.lastTime = currentTime;

    // 不再更新时间限制
    this.ui.updateTime();

    // 更新AI
    this.ai.update(deltaTime);

    // 更新所有玩家
    this.players.updateAll(deltaTime);

    // 更新UI弹药显示
    this.ui.updateWeaponText();

    // 更新子弹
    this.bullets.update(deltaTime);

    // 更新射击特效
    this.effectManager.update();

    // 更新血包
    this.healthPacks.update(deltaTime);
  }

  public resetTime(): void {
    this.lastTime = 0;
  }
}
