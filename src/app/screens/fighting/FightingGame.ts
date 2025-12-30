import { Container } from "pixi.js";

import { Fighter } from "./fighter/Fighter";
import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { PlayerManager, PlayerConfig } from "./entities/PlayerManager";
import { GameInput } from "./GameInput";
import { FightingStage } from "./ui/FightingStage";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameMode } from "./types";

/** 战斗游戏管理器 - 俯视角 */
export class FightingGame extends Container {
  public static readonly CONFIG = {
    stageWidth: 1200,
    stageHeight: 800,
    roundTime: 99,
  };

  public mode: GameMode = GameMode.VS_CPU;

  public gameRunning: boolean = false;
  public roundTime: number = FightingGame.CONFIG.roundTime;
  private lastTime: number = 0;

  public currentRound: number = 1;

  private stage: FightingStage;
  public ui: GameUI;
  private input: GameInput;
  public bullets: BulletManager;
  private effectManager: EffectManager;
  public healthPacks: HealthPackManager;
  private ai: GameAI;
  public players: PlayerManager;

  constructor(mode: GameMode = GameMode.VS_CPU) {
    super();
    this.mode = mode;

    // 配置玩家 - 可以轻松添加或删除玩家
    const playerConfigs: PlayerConfig[] = [
      {
        name: "P1",
        color: 0x4488ff,
        startX: 0,
        startY: 300,
        isAI: false,
      }, // 玩家1 (下方中央)
      {
        name: "E1",
        color: 0xff6644,
        startX: -200,
        startY: -200,
        isAI: true,
      }, // 敌人1 (左上)
      {
        name: "E2",
        color: 0x44ff44,
        startX: 0,
        startY: -250,
        isAI: true,
      }, // 敌人2 (中上)
      {
        name: "E3",
        color: 0xff44ff,
        startX: 200,
        startY: -200,
        isAI: true,
      }, // 敌人3 (右上)
      {
        name: "E4",
        color: 0xffff44,
        startX: -300,
        startY: 0,
        isAI: true,
      }, // 敌人4 (左中)
      {
        name: "E5",
        color: 0x44ffff,
        startX: 300,
        startY: 0,
        isAI: true,
      }, // 敌人5 (右中)
    ];

    this.players = new PlayerManager(playerConfigs);

    this.stage = new FightingStage();
    this.ui = new GameUI(this);
    this.input = new GameInput(this);
    this.bullets = new BulletManager(this);
    this.effectManager = new EffectManager(this);
    this.healthPacks = new HealthPackManager(this);
    this.ai = new GameAI(this);

    // 初始化回合显示
    this.ui.updateRound(this.currentRound);

    this.addChildren();
  }

  private addChildren(): void {
    this.addChild(this.stage.container);
    this.players.getAllPlayers().forEach((player) => {
      this.addChild(player);
    });
    this.addChild(this.ui.container);
  }

  public update(currentTime: number): void {
    if (!this.gameRunning) return;

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

    // 限制位置
    this.clampPositions();

    // 碰撞检测
    this.bullets.checkCollisions();
    this.checkMeleeCollisions();

    // 再次限制位置
    this.clampPositions();

    // 检测游戏结束（不再检测时间限制）
    this.checkGameOver();
  }

  private checkMeleeCollisions(): void {
    const allPlayers = this.players.getAllPlayers();

    // 检查每个攻击者对其他所有人的攻击
    for (const attacker of allPlayers) {
      const attack = attacker.getCurrentAttack();
      if (attack.isActive && attack.data) {
        if (attack.data.projectile && !attack.hasHit) {
          // 投射物攻击 - 生成子弹
          console.log(
            `[FightingGame] Spawning bullet - angle: ${attack.angle.toFixed(2)}`,
          );
          this.bullets.spawnBullet(attacker, attack.angle, attack.data);

          // 创建射击特效
          this.effectManager.createShootingEffect(
            attacker,
            attacker.currentWeapon,
            attack.angle,
          );

          attacker.markHit();
        } else if (!attack.data.projectile) {
          // 近战攻击 - 检查所有目标
          for (const target of allPlayers) {
            if (attacker === target) continue; // 不攻击自己

            const dist = this.getDistance(attacker, target);
            if (dist < attack.data.range + Fighter.CONFIG.radius) {
              target.takeHit(
                attack.data.damage,
                attack.data.knockback,
                attacker.x,
                attacker.y,
                attacker, // 传入攻击者
              );
              attacker.markHit();
              break; // 近战攻击只命中一个目标
            }
          }
        }
      }
    }
  }

  private getDistance(f1: Fighter, f2: Fighter): number {
    const dx = f1.x - f2.x;
    const dy = f1.y - f2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private clampPositions(): void {
    const hw = FightingGame.CONFIG.stageWidth / 2 - Fighter.CONFIG.radius;
    const hh = FightingGame.CONFIG.stageHeight / 2 - Fighter.CONFIG.radius;

    const allPlayers = this.players.getAllPlayers();

    // 限制在舞台范围内
    allPlayers.forEach((p) => {
      p.x = Math.max(-hw, Math.min(hw, p.x));
      p.y = Math.max(-hh, Math.min(hh, p.y));
    });

    // 角色间碰撞
    const minDist = Fighter.CONFIG.radius * 2;

    for (let i = 0; i < allPlayers.length; i++) {
      for (let j = i + 1; j < allPlayers.length; j++) {
        const f1 = allPlayers[i];
        const f2 = allPlayers[j];
        const dx = f2.x - f1.x;
        const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          f1.x -= nx * overlap;
          f1.y -= ny * overlap;
          f2.x += nx * overlap;
          f2.y += ny * overlap;
        }
      }
    }
  }

  private checkGameOver(): boolean {
    const aliveFighters = this.players.getAlivePlayers();

    if (aliveFighters.length <= 1) {
      this.gameRunning = false;

      // 更新比分 - 存活者得分
      if (aliveFighters.length === 1) {
        const winner = aliveFighters[0];
        const winnerIndex = this.players.findPlayerIndex(winner);
        if (winnerIndex !== -1) {
          this.players.addScore(winnerIndex);
        }
      }

      const scores = this.players.getAllScores();
      this.ui.updateScore(scores);
      this.ui.showWinner();

      // 延迟后自动开启下一局
      setTimeout(() => {
        this.startNextRound();
      }, 2000);

      return true;
    }
    return false;
  }

  public async start(): Promise<void> {
    this.reset();
    this.ui.updateWeaponText();
    this.gameRunning = true;
    this.lastTime = 0;

    this.ui.showRoundAnimation(() => {
      this.lastTime = performance.now();
    });
  }

  public reset(): void {
    this.players.resetAll();
    this.roundTime = FightingGame.CONFIG.roundTime;
    this.gameRunning = false;
    this.ai.reset();
    this.bullets.clear();
    this.effectManager.clear();
    this.healthPacks.clear();
    this.input.clearAllInputs();
  }

  private startNextRound(): void {
    this.currentRound++;
    this.ui.updateRound(this.currentRound);
    this.ui.hideWinner();

    // 重置角色位置和状态
    this.players.resetAll();

    // 自动开始
    this.start();
  }

  public restart(): void {
    // 重置比分和回合
    this.players.resetScores();
    this.currentRound = 1;

    const zeroScores = new Array(this.players.getPlayerCount()).fill(0);
    this.ui.updateScore(zeroScores);
    this.ui.updateRound(1);
    this.reset();
    this.start();
  }
}
