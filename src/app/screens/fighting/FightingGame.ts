import { Container } from "pixi.js";

import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { PlayerManager, PlayerConfig } from "./entities/PlayerManager";
import { GameInput } from "./GameInput";
import { FightingStage } from "./ui/FightingStage";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameMode } from "./types";
import { CollisionSystem } from "./systems/CollisionSystem";
import { GameLoopManager } from "./systems/GameLoopManager";

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

  public currentRound: number = 1;

  private stage: FightingStage;
  public ui: GameUI;
  private input: GameInput;
  public bullets: BulletManager;
  private effectManager: EffectManager;
  public healthPacks: HealthPackManager;
  private ai: GameAI;
  public players: PlayerManager;
  private collisionSystem: CollisionSystem;
  private gameLoopManager: GameLoopManager;

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

    // 初始化系统
    this.collisionSystem = new CollisionSystem(
      FightingGame.CONFIG.stageWidth,
      FightingGame.CONFIG.stageHeight,
      this.bullets,
      this.effectManager,
    );

    this.gameLoopManager = new GameLoopManager(
      this.ui,
      this.ai,
      this.players,
      this.bullets,
      this.effectManager,
      this.healthPacks,
    );

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

    // 更新游戏循环
    this.gameLoopManager.update(currentTime);

    // 限制位置
    this.collisionSystem.clampPositions(this.players.getAllPlayers());

    // 碰撞检测
    this.bullets.checkCollisions();
    this.collisionSystem.checkMeleeCollisions(this.players.getAllPlayers());

    // 再次限制位置
    this.collisionSystem.clampPositions(this.players.getAllPlayers());

    // 检测游戏结束（不再检测时间限制）
    this.checkGameOver();
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
    this.gameLoopManager.resetTime();

    this.ui.showRoundAnimation(() => {
      this.gameLoopManager.resetTime();
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
