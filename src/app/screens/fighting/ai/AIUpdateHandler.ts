/**
 * AI 更新处理器
 * 处理单个 AI 的更新逻辑，包括定时器、状态和行为
 */

import { Fighter } from "../fighter/Fighter";
import { BulletManager } from "../combat/BulletManager";
import { HealthPack } from "../entities/HealthPack";
import { AIController } from "./AIController";
import { AIStateExecutor } from "./AIStateExecutor";
import { AIHealthPackBehavior } from "./AIHealthPackBehavior";
import { AIBulletDodge } from "./AIBulletDodge";
import { AITargetSelector } from "./AITargetSelector";
import { AIAiming } from "./AIAiming";

export class AIUpdateHandler {
  private targetSelector: AITargetSelector;

  constructor(
    private bullets: BulletManager,
    private healthPackBehavior: AIHealthPackBehavior,
    private bulletDodge: AIBulletDodge,
    private stateExecutor: AIStateExecutor,
  ) {
    this.targetSelector = new AITargetSelector();
  }

  public update(
    ai: Fighter,
    controller: AIController,
    deltaTime: number,
    allPlayers: Fighter[],
    healthPacks: HealthPack[],
  ): void {
    if (ai.isDead) return;

    const otherPlayers = allPlayers.filter((p) => p !== ai);
    const aliveTargets = otherPlayers.filter((t) => !t.isDead);

    if (aliveTargets.length === 0) return;

    const { target, targetDistance } = this.targetSelector.selectBestTarget(
      ai,
      aliveTargets,
    );

    // AI 使用预判瞄准面向目标
    AIAiming.aimAtTargetWithPrediction(ai, target, targetDistance, controller);

    const dx = target.x - ai.x;
    const dy = target.y - ai.y;

    this.stateExecutor.clearAIInput(ai);
    this.updateTimers(controller, deltaTime);

    if (this.handleIdling(controller)) return;

    if (
      this.handleReactionDelay(
        controller,
        ai,
        targetDistance,
        dx,
        dy,
        deltaTime,
      )
    ) {
      return;
    }

    if (this.handleBulletDodging(ai)) return;

    if (this.handleHealthPackBehavior(ai, healthPacks)) return;

    this.makeDecision(ai, controller, targetDistance);

    this.handleWeaponSwitch(controller, ai, targetDistance);

    this.stateExecutor.executeState(ai, targetDistance, dx, dy);

    const newTimer = this.stateExecutor.getTimer();
    this.stateExecutor.setTimer(newTimer - deltaTime);
  }

  private updateTimers(controller: AIController, deltaTime: number): void {
    controller.decisionCooldown -= deltaTime;
    controller.reactionDelay -= deltaTime;
    controller.idleTimer -= deltaTime;
    controller.weaponSwitchCooldown -= deltaTime;

    if (controller.decisionCooldown < 0) controller.decisionCooldown = 0;
    if (controller.reactionDelay < 0) controller.reactionDelay = 0;
    if (controller.idleTimer < 0) controller.idleTimer = 0;
    if (controller.weaponSwitchCooldown < 0)
      controller.weaponSwitchCooldown = 0;
  }

  private handleIdling(controller: AIController): boolean {
    if (!controller.isIdling) return false;

    if (controller.idleTimer <= 0) {
      controller.isIdling = false;
      controller.reactionDelay = 200 + Math.random() * 300;
      return false;
    }

    return true;
  }

  private handleReactionDelay(
    controller: AIController,
    ai: Fighter,
    targetDistance: number,
    dx: number,
    dy: number,
    deltaTime: number,
  ): boolean {
    if (controller.reactionDelay <= 0) return false;

    this.stateExecutor.executeState(ai, targetDistance, dx, dy);

    const newTimer = this.stateExecutor.getTimer();
    this.stateExecutor.setTimer(newTimer - deltaTime);
    return true;
  }

  private handleBulletDodging(ai: Fighter): boolean {
    const isDodging = this.bulletDodge.checkAndDodgeBullets(ai, this.bullets);
    return isDodging;
  }

  private handleHealthPackBehavior(
    ai: Fighter,
    healthPacks: HealthPack[],
  ): boolean {
    const aiHealthPercent = ai.health / Fighter.CONFIG.maxHealth;
    if (aiHealthPercent < 0.6) {
      this.healthPackBehavior.checkForHealthPack(ai, healthPacks);
    }

    if (this.healthPackBehavior.hasTarget()) {
      this.healthPackBehavior.moveToHealthPack(ai);
      return true;
    }
    return false;
  }

  private makeDecision(
    ai: Fighter,
    controller: AIController,
    targetDistance: number,
  ): void {
    if (controller.decisionCooldown <= 0) {
      controller.decisionCooldown = 500;
      controller.decision.makeDecision(targetDistance, ai);
      const newState = controller.decision.getState();
      this.stateExecutor.setState(newState);
      this.stateExecutor.setTimer(controller.decision.getTimer());
      controller.reactionDelay = controller.decision.getReactionDelay();
    }
  }

  private handleWeaponSwitch(
    controller: AIController,
    ai: Fighter,
    targetDistance: number,
  ): void {
    if (controller.weaponSwitchCooldown <= 0) {
      const cooldown = controller.decision.decideWeapon(targetDistance, ai);
      if (cooldown > 0) {
        controller.weaponSwitchCooldown = cooldown;
      }
    }
  }
}
