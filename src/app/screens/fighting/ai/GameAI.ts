/**
 * 游戏AI系统主控制器
 * 管理所有AI玩家的更新和决策
 */

import { FightingGame } from "../FightingGame";
import { AIStateExecutor } from "./AIStateExecutor";
import { AIHealthPackBehavior } from "./AIHealthPackBehavior";
import { AIBulletDodge } from "./AIBulletDodge";
import { AIControllerManager } from "./AIControllerManager";
import { AIUpdateHandler } from "./AIUpdateHandler";

export class GameAI {
  private game: FightingGame;
  private stateExecutor: AIStateExecutor;
  private healthPackBehavior: AIHealthPackBehavior;
  private bulletDodge: AIBulletDodge;
  private controllerManager: AIControllerManager;
  private updateHandler: AIUpdateHandler;

  constructor(game: FightingGame) {
    this.game = game;
    this.stateExecutor = new AIStateExecutor();
    this.healthPackBehavior = new AIHealthPackBehavior();
    this.bulletDodge = new AIBulletDodge();

    this.controllerManager = new AIControllerManager();
    this.controllerManager.initialize(this.game.players.getAIPlayers());

    this.updateHandler = new AIUpdateHandler(
      this.game.bullets,
      this.healthPackBehavior,
      this.bulletDodge,
      this.stateExecutor,
    );
  }

  public update(deltaTime: number): void {
    if (this.game.mode !== "vs_cpu") return;

    const aiPlayers = this.game.players.getAIPlayers();

    aiPlayers.forEach((ai) => {
      const controller = this.controllerManager.get(ai);
      if (!controller) return;

      this.updateHandler.update(
        ai,
        controller,
        deltaTime,
        this.game.players.getAllPlayers(),
        this.game.healthPacks.getHealthPacks(),
      );
    });
  }

  public reset(): void {
    this.controllerManager.resetAll();
    this.healthPackBehavior.reset();
  }
}
