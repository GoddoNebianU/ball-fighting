/**
 * AI 控制器管理器
 * 管理所有 AI 的控制器初始化和重置
 */

import { Fighter } from "../fighter/Fighter";
import { AIController, AIControllerFactory } from "./AIController";

export class AIControllerManager {
  private controllers: Map<Fighter, AIController> = new Map();

  public initialize(aiPlayers: Fighter[]): void {
    aiPlayers.forEach((ai) => {
      this.controllers.set(ai, AIControllerFactory.create());
    });
  }

  public get(ai: Fighter): AIController | undefined {
    return this.controllers.get(ai);
  }

  public resetAll(): void {
    this.controllers.forEach((controller) => {
      AIControllerFactory.reset(controller);
    });
  }

  public getAll(): Map<Fighter, AIController> {
    return this.controllers;
  }
}
