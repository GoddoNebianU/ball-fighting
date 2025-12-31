import { Fighter } from "../fighter/Fighter";
import { FightingGame } from "../FightingGame";
import { AIDecision } from "./AIDecision";
import { AIStateExecutor } from "./AIStateExecutor";
import { AIHealthPackBehavior } from "./AIHealthPackBehavior";
import { AIBulletDodge } from "./AIBulletDodge";
import { AIAimController } from "./AIAimController";

/** AI控制器状态 */
interface AIController {
  decision: AIDecision;
  decisionCooldown: number;
  reactionDelay: number;
  idleTimer: number;
  isIdling: boolean;
  weaponSwitchCooldown: number;
  speechTimer: number; // 说话计时器
  speechCooldown: number; // 说话冷却
}

/** AI系统 - 支持动态数量的AI */
export class GameAI {
  private game: FightingGame;
  private stateExecutor: AIStateExecutor;
  private healthPackBehavior: AIHealthPackBehavior;
  private bulletDodge: AIBulletDodge;
  private aimController: AIAimController;
  private aiControllers: Map<Fighter, AIController> = new Map();

  constructor(game: FightingGame) {
    this.game = game;
    this.stateExecutor = new AIStateExecutor();
    this.healthPackBehavior = new AIHealthPackBehavior();
    this.bulletDodge = new AIBulletDodge();
    this.aimController = new AIAimController();

    // 为每个AI玩家创建控制器
    this.initializeAIControllers();
  }

  private initializeAIControllers(): void {
    const aiPlayers = this.game.players.getAIPlayers();

    aiPlayers.forEach((ai) => {
      // 随机8-12秒的说话间隔
      const speechInterval = 8000 + Math.random() * 4000;

      this.aiControllers.set(ai, {
        decision: new AIDecision(),
        decisionCooldown: 0,
        reactionDelay: 0,
        idleTimer: 0,
        isIdling: false,
        weaponSwitchCooldown: 0,
        speechTimer: speechInterval, // 初始计时器
        speechCooldown: 0,
      });
    });
  }

  public update(deltaTime: number): void {
    if (this.game.mode !== "vs_cpu") return;

    const aiPlayers = this.game.players.getAIPlayers();

    // 更新每个AI
    aiPlayers.forEach((ai) => {
      const controller = this.aiControllers.get(ai);
      if (!controller) return;

      this.updateAI(ai, controller, deltaTime);
    });
  }

  private updateAI(
    ai: Fighter,
    controller: AIController,
    deltaTime: number,
  ): void {
    // 如果AI已经死亡,跳过更新
    if (ai.isDead) {
      return;
    }

    // 获取所有其他玩家作为目标
    const allPlayers = this.game.players.getAllPlayers();
    const otherPlayers = allPlayers.filter((p) => p !== ai);

    // 过滤掉已死亡的目标
    const aliveTargets = otherPlayers.filter((t) => !t.isDead);

    // 如果没有存活的目标,返回
    if (aliveTargets.length === 0) {
      return;
    }

    // 选择最佳目标:优先攻击伤害过自己的角色
    let bestTarget = aliveTargets[0];
    let bestScore = -Infinity;
    let bestDist = 0;

    for (const t of aliveTargets) {
      const dist = this.getDistance(ai, t);
      let score = 1000 - dist + (100 - t.health);

      // 如果这个角色伤害过AI,大幅提高优先级
      if (ai.lastAttacker === t) {
        score += 500; // 额外的500分优先级
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = t;
        bestDist = dist;
      }
    }

    const target = bestTarget;
    const targetDistance = bestDist;

    // AI使用预判瞄准面向目标
    this.aimController.aimAtTargetWithPrediction(ai, target, targetDistance);

    // 计算方向
    const dx = target.x - ai.x;
    const dy = target.y - ai.y;

    // 调试日志
    const aiIndex = this.game.players.findPlayerIndex(ai);
    if (Math.random() < 0.01) {
      console.log(
        `[AI${aiIndex}] dist: ${targetDistance.toFixed(0)} state: ${this.stateExecutor.getState()} cooldown: ${controller.decisionCooldown.toFixed(0)}`,
      );
    }

    // 重置AI输入
    this.stateExecutor.clearAIInput(ai);

    // 更新计时器
    controller.decisionCooldown -= deltaTime;
    controller.reactionDelay -= deltaTime;
    controller.idleTimer -= deltaTime;
    controller.weaponSwitchCooldown -= deltaTime;
    controller.speechTimer -= deltaTime;
    controller.speechCooldown -= deltaTime;

    // 防止计时器变成负数
    if (controller.decisionCooldown < 0) controller.decisionCooldown = 0;
    if (controller.reactionDelay < 0) controller.reactionDelay = 0;
    if (controller.speechTimer < 0) controller.speechTimer = 0;
    if (controller.speechCooldown < 0) controller.speechCooldown = 0;

    // 处理AI说话逻辑
    if (controller.speechTimer <= 0 && controller.speechCooldown <= 0) {
      // 75%概率显示"hello"
      if (Math.random() < 0.75) {
        ai.showSpeech("hello");
      }

      // 重置计时器 (随机8-12秒)
      controller.speechTimer = 8000 + Math.random() * 4000;
      controller.speechCooldown = 500; // 500ms冷却，避免重复触发
    }
    if (controller.idleTimer < 0) controller.idleTimer = 0;
    if (controller.weaponSwitchCooldown < 0)
      controller.weaponSwitchCooldown = 0;

    console.log(
      `[AI${aiIndex}] After timer update - cooldown: ${controller.decisionCooldown.toFixed(0)}, reactionDelay: ${controller.reactionDelay.toFixed(0)}, isIdling: ${controller.isIdling}`,
    );

    // 检查是否在摸鱼
    if (controller.isIdling) {
      console.log(
        `[AI${aiIndex}] CHECK: isIdling=true, idleTimer: ${controller.idleTimer.toFixed(0)}`,
      );
      if (controller.idleTimer <= 0) {
        controller.isIdling = false;
        controller.reactionDelay = 200 + Math.random() * 300;
        console.log(
          `[AI${aiIndex}] EXIT: Idle finished, set reactionDelay: ${controller.reactionDelay.toFixed(0)}`,
        );
      } else {
        console.log(
          `[AI${aiIndex}] RETURN: Still idling for ${controller.idleTimer.toFixed(0)}ms`,
        );
        return;
      }
    }

    // 反应延时期间 - 继续执行上一个状态,但不做新决策
    if (controller.reactionDelay > 0) {
      console.log(
        `[AI${aiIndex}] In reactionDelay=${controller.reactionDelay.toFixed(0)}, prevState=${controller.decision.getPreviousState()}`,
      );
      // 继续执行上一个状态,但不做新决策
      this.stateExecutor.executeState(ai, targetDistance, dx, dy);

      // 执行后更新stateExecutor的timer
      const newTimer = this.stateExecutor.getTimer();
      this.stateExecutor.setTimer(newTimer - deltaTime);
      return;
    }

    console.log(`[AI${aiIndex}] Passed all early returns, entering main logic`);

    // 【新增】优先检查并躲避子弹
    const isDodging = this.bulletDodge.checkAndDodgeBullets(
      ai,
      this.game.bullets,
    );
    if (isDodging) {
      console.log(`[AI${aiIndex}] Dodging bullet, skipping normal logic`);
      // 躲避子弹时不执行正常状态,直接返回,保留dodge设置的输入
      return;
    }

    // 检查是否需要捡血包
    const aiHealthPercent = ai.health / Fighter.CONFIG.maxHealth;
    if (aiHealthPercent < 0.6) {
      this.healthPackBehavior.checkForHealthPack(
        ai,
        this.game["healthPacks"].getHealthPacks(),
      );
    }

    // 如果正在前往血包
    if (this.healthPackBehavior.hasTarget()) {
      this.healthPackBehavior.moveToHealthPack(ai);
      console.log(`[AI${aiIndex}] Going to health pack, skipping decision`);
      return;
    }

    // 决策前调试
    console.log(
      `[AI${aiIndex}] Before decision check - cooldown: ${controller.decisionCooldown.toFixed(0)}`,
    );

    // 决策
    if (controller.decisionCooldown <= 0) {
      console.log(
        `[AI${aiIndex}] Making decision - cooldown was ${controller.decisionCooldown.toFixed(0)}`,
      );
      controller.decisionCooldown = 500;
      const oldState = controller.decision.getState();
      controller.decision.makeDecision(targetDistance, ai);
      const newState = controller.decision.getState();
      this.stateExecutor.setState(newState);
      // 使用decision返回的timer值设置stateExecutor的timer
      this.stateExecutor.setTimer(controller.decision.getTimer());
      controller.reactionDelay = controller.decision.getReactionDelay();

      // 调试决策
      if (oldState !== newState && Math.random() < 0.05) {
        console.log(
          `[AI${aiIndex}] Decision: ${oldState} -> ${newState}, dist: ${targetDistance.toFixed(0)}`,
        );
      }
    }

    // 换武器决策
    if (controller.weaponSwitchCooldown <= 0) {
      const cooldown = controller.decision.decideWeapon(targetDistance, ai);
      if (cooldown > 0) {
        controller.weaponSwitchCooldown = cooldown;
      }
    }

    // 随机摸鱼 - 暂时禁用,等AI正常工作后再启用
    // if (Math.random() < 0.002) { // 降低到0.2%概率
    //   controller.isIdling = true;
    //   controller.idleTimer = 800 + Math.random() * 1500;
    //   this.stateExecutor.setState("idle");
    //   this.stateExecutor.setTimer(0);
    //   return;
    // }

    // 执行状态
    this.stateExecutor.executeState(ai, targetDistance, dx, dy);

    // 执行后更新stateExecutor的timer
    const newTimer = this.stateExecutor.getTimer();
    this.stateExecutor.setTimer(newTimer - deltaTime);
  }

  private getDistance(f1: Fighter, f2: Fighter): number {
    const dx = f1.x - f2.x;
    const dy = f1.y - f2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public reset(): void {
    // 重置所有AI控制器
    this.aiControllers.forEach((controller) => {
      controller.decision.reset();
      controller.decisionCooldown = 0;
      controller.reactionDelay = 500;
      controller.idleTimer = 0;
      controller.isIdling = false;
      controller.weaponSwitchCooldown = 1000;
    });

    this.aimController.reset();
    this.healthPackBehavior.reset();
  }
}
