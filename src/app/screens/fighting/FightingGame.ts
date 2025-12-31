import { Container } from "pixi.js";

import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { PlayerManager, PlayerConfig } from "./entities/PlayerManager";
import { GameInput } from "./GameInput";
import { FightingStage } from "./ui/FightingStage";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameLoop } from "./GameLoop";
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

  public currentRound: number = 1;

  private stage: FightingStage;
  public ui: GameUI;
  private input: GameInput;
  public bullets: BulletManager;
  private effectManager: EffectManager;
  public healthPacks: HealthPackManager;
  private ai: GameAI;
  public players: PlayerManager;
  private gameLoop: GameLoop;
  public speechBubblesContainer: Container; // 对话气泡容器，不受角色旋转影响

  constructor(mode: GameMode = GameMode.VS_CPU) {
    super();
    this.mode = mode;

    // 配置玩家 - 可以轻松添加或删除玩家
    const playerConfigs: PlayerConfig[] = [
      {
        name: "Alex",
        color: 0x4488ff,
        startX: 0,
        startY: 300,
        isAI: false,
      }, // 玩家1 (下方中央)
      {
        name: "Bob",
        color: 0xff6644,
        startX: -200,
        startY: -200,
        isAI: true,
      }, // 敌人1 (左上)
      {
        name: "Charlie",
        color: 0x44ff44,
        startX: 0,
        startY: -250,
        isAI: true,
      }, // 敌人2 (中上)
      {
        name: "Diana",
        color: 0xff44ff,
        startX: 200,
        startY: -200,
        isAI: true,
      }, // 敌人3 (右上)
      {
        name: "Eric",
        color: 0xffff44,
        startX: -300,
        startY: 0,
        isAI: true,
      }, // 敌人4 (左中)
      {
        name: "Fiona",
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
    this.speechBubblesContainer = new Container(); // 创建对话气泡容器

    // 创建游戏循环系统
    this.gameLoop = new GameLoop(
      this.bullets,
      this.effectManager,
      this.healthPacks,
      this.input,
      this.ui,
      this.ai,
      this.players.getAllPlayers(),
      () => this.onGameOver(), // 游戏结束回调
    );

    // 初始化回合显示
    this.ui.updateRound(this.currentRound);

    this.addChildren();

    // 将所有对话气泡添加到独立容器
    this.players.getAllPlayers().forEach((player) => {
      const bubble = player.getSpeechBubble().getContainer();
      this.speechBubblesContainer.addChild(bubble);
    });
  }

  private addChildren(): void {
    this.addChild(this.stage.container);
    this.players.getAllPlayers().forEach((player) => {
      this.addChild(player);
    });
    this.addChild(this.speechBubblesContainer); // 添加对话气泡容器，在UI之前
    this.addChild(this.ui.container);
  }

  public update(currentTime: number): void {
    this.gameLoop.update(currentTime);
    this.gameRunning = this.gameLoop.isGameRunning();
  }

  public async start(): Promise<void> {
    this.reset();
    this.ui.updateWeaponText();
    this.gameLoop.setGameRunning(true);
    this.gameLoop.resetTime();

    this.ui.showRoundAnimation(() => {
      this.gameLoop.resetTime();
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
    this.gameLoop.updatePlayersList(this.players.getAllPlayers());
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

  /** 延迟后自动开启下一局 */
  public startNextRoundDelayed(): void {
    setTimeout(() => {
      this.startNextRound();
    }, 2000);
  }

  /** 游戏结束处理 - 更新比分并准备下一局 */
  private onGameOver(): void {
    const aliveFighters = this.players.getAlivePlayers();

    // 更新比分 - 存活者得分
    if (aliveFighters.length === 1) {
      const winner = aliveFighters[0];
      const winnerIndex = this.players.findPlayerIndex(winner);
      if (winnerIndex !== -1) {
        this.players.addScore(winnerIndex);
      }
    }

    // 更新UI显示的比分
    const scores = this.players.getAllScores();
    this.ui.updateScore(scores);

    // 自动开启下一局
    this.startNextRound();
  }
}
