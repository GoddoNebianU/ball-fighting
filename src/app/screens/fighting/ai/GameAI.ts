import { Fighter } from "../fighter/Fighter";
import { FightingGame } from "../FightingGame";
import { AIDecision } from "./AIDecision";
import { AIStateExecutor } from "./AIStateExecutor";
import { AIHealthPackBehavior } from "./AIHealthPackBehavior";
import { AIBulletDodge } from "./AIBulletDodge";

/** AI控制器状态 */
interface AIController {
  decision: AIDecision;
  decisionCooldown: number;
  reactionDelay: number;
  idleTimer: number;
  isIdling: boolean;
  weaponSwitchCooldown: number;
  // PID瞄准控制器状态
  pidAim: {
    integralX: number; // X方向积分累积
    integralY: number; // Y方向积分累积
    lastErrorX: number; // 上次X方向误差(用于微分)
    lastErrorY: number; // 上次Y方向误差(用于微分)
  };
}

/** AI系统 - 支持动态数量的AI */
export class GameAI {
  private game: FightingGame;
  private stateExecutor: AIStateExecutor;
  private healthPackBehavior: AIHealthPackBehavior;
  private bulletDodge: AIBulletDodge;
  private aiControllers: Map<Fighter, AIController> = new Map();

  constructor(game: FightingGame) {
    this.game = game;
    this.stateExecutor = new AIStateExecutor();
    this.healthPackBehavior = new AIHealthPackBehavior();
    this.bulletDodge = new AIBulletDodge();

    // 为每个AI玩家创建控制器
    this.initializeAIControllers();
  }

  private initializeAIControllers(): void {
    const aiPlayers = this.game.players.getAIPlayers();

    aiPlayers.forEach((ai) => {
      this.aiControllers.set(ai, {
        decision: new AIDecision(),
        decisionCooldown: 0,
        reactionDelay: 0,
        idleTimer: 0,
        isIdling: false,
        weaponSwitchCooldown: 0,
        pidAim: {
          integralX: 0,
          integralY: 0,
          lastErrorX: 0,
          lastErrorY: 0,
        },
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
    this.aimAtTargetWithPrediction(ai, target, targetDistance);

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

    // 防止计时器变成负数
    if (controller.decisionCooldown < 0) controller.decisionCooldown = 0;
    if (controller.reactionDelay < 0) controller.reactionDelay = 0;
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

  /** PID预判瞄准 - 使用PID控制器智能追踪目标 */
  private aimAtTargetWithPrediction(
    ai: Fighter,
    target: Fighter,
    currentDistance: number,
  ): void {
    const controller = this.aiControllers.get(ai);
    if (!controller) return;

    // 获取当前武器数据
    const weaponData = ai.currentWeapon.getData();

    // 只有投射物武器才需要预判
    if (!weaponData.projectile) {
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    // 获取子弹速度
    const bulletSpeed = weaponData.projectileSpeed || 800;
    const timeToImpact = currentDistance / bulletSpeed;

    // 计算目标速度
    const targetSpeed = Math.sqrt(
      target.velocityX * target.velocityX + target.velocityY * target.velocityY,
    );

    // 如果目标几乎静止,直接瞄准目标位置,不使用PID
    if (targetSpeed < 10) {
      // 目标静止,清零PID累积误差
      controller.pidAim.integralX = 0;
      controller.pidAim.integralY = 0;
      controller.pidAim.lastErrorX = 0;
      controller.pidAim.lastErrorY = 0;

      // 直接瞄准目标当前位置
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    // PID参数 - 只在目标移动时使用
    const kp = 1.0; // 比例系数: 当前误差权重
    const ki = 0.03; // 积分系数: 历史累积误差权重(用于追踪持续移动目标)
    const kd = 0.1; // 微分系数: 误差变化率权重(用于预测移动趋势)

    // 计算目标预测位置(基础预测)
    const predictedX = target.x + target.velocityX * timeToImpact;
    const predictedY = target.y + target.velocityY * timeToImpact;

    // 计算当前误差(目标位置 - AI当前位置)
    const errorX = predictedX - ai.x;
    const errorY = predictedY - ai.y;

    // P项: 比例控制 - 当前误差
    const pX = errorX * kp;
    const pY = errorY * kp;

    // I项: 积分控制 - 累积误差
    // 限制积分项范围,防止积分饱和
    const integralLimit = 50;
    controller.pidAim.integralX += errorX * ki;
    controller.pidAim.integralY += errorY * ki;
    controller.pidAim.integralX = Math.max(
      -integralLimit,
      Math.min(integralLimit, controller.pidAim.integralX),
    );
    controller.pidAim.integralY = Math.max(
      -integralLimit,
      Math.min(integralLimit, controller.pidAim.integralY),
    );

    // D项: 微分控制 - 误差变化率
    const dX = (errorX - controller.pidAim.lastErrorX) * kd;
    const dY = (errorY - controller.pidAim.lastErrorY) * kd;

    // 保存当前误差供下次使用
    controller.pidAim.lastErrorX = errorX;
    controller.pidAim.lastErrorY = errorY;

    // PID输出: 目标偏移量
    const aimOffsetX = pX + controller.pidAim.integralX + dX;
    const aimOffsetY = pY + controller.pidAim.integralY + dY;

    // 计算最终瞄准位置
    const finalAimX = ai.x + aimOffsetX;
    const finalAimY = ai.y + aimOffsetY;

    // 调试日志
    const aiIndex = this.game.players.findPlayerIndex(ai);
    if (Math.random() < 0.01) {
      console.log(
        `[AI${aiIndex}] PID aim - dist: ${currentDistance.toFixed(0)}, targetSpeed: ${targetSpeed.toFixed(0)}, PID: P(${pX.toFixed(0)},${pY.toFixed(0)}) I(${controller.pidAim.integralX.toFixed(0)},${controller.pidAim.integralY.toFixed(0)}) D(${dX.toFixed(0)},${dY.toFixed(0)})`,
      );
    }

    // 向最终瞄准位置瞄准
    ai.setFacingDirection(finalAimX, finalAimY);
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
      // 重置PID瞄准状态
      controller.pidAim.integralX = 0;
      controller.pidAim.integralY = 0;
      controller.pidAim.lastErrorX = 0;
      controller.pidAim.lastErrorY = 0;
    });

    this.healthPackBehavior.reset();
  }
}
