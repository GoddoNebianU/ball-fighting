import { Container } from "pixi.js";
import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { KillToast } from "./combat/KillToast";
import { KillHistory } from "./combat/KillHistory";
import { PlayerManager, PlayerConfig } from "./entities/PlayerManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { GameInput } from "./GameInput";
import { FightingStage } from "./ui/FightingStage";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameLoop } from "./GameLoop";
import { GameMode } from "./types";

export class FightingGame extends Container {
  static readonly CONFIG = {
    stageWidth: 1200,
    stageHeight: 800,
    roundTime: 99,
  };
  mode: GameMode = GameMode.VS_CPU;
  gameRunning = false;
  roundTime = FightingGame.CONFIG.roundTime;
  currentRound = 1;

  private stage: FightingStage;
  ui: GameUI;
  private input: GameInput;
  bullets: BulletManager;
  private effectManager: EffectManager;
  healthPacks: HealthPackManager;
  private ai: GameAI;
  players: PlayerManager = null!;
  private gameLoop: GameLoop;
  nameTagsContainer: Container;
  private killToastsContainer: Container;
  private killHistory: KillHistory;
  private killToasts: KillToast[] = [];

  constructor(mode: GameMode = GameMode.VS_CPU) {
    super();
    this.mode = mode;
    this.stage = new FightingStage();
    this.ui = new GameUI(this);
    this.input = new GameInput(this);
    this.bullets = new BulletManager(this);
    this.effectManager = new EffectManager(this);
    this.healthPacks = new HealthPackManager(this);
    this.ai = new GameAI(this);
    this.nameTagsContainer = new Container();
    this.killToastsContainer = new Container();
    this.killHistory = new KillHistory();

    this.gameLoop = new GameLoop(
      this.bullets,
      this.effectManager,
      this.healthPacks,
      this.input,
      this.ui,
      this.ai,
      [],
      () => this.onGameOver(),
    );

    this.ui.updateRound(this.currentRound);
    this.addChildrenBase();
  }

  /** 添加基础子对象（不包括玩家） */
  private addChildrenBase(): void {
    this.addChild(this.stage.container);
    this.addChild(this.nameTagsContainer);
    this.addChild(this.killToastsContainer);
    this.addChild(this.ui.container);
  }

  /** 添加玩家到场景 */
  private addPlayers(): void {
    if (!this.players) return;
    this.players.getAllPlayers().forEach((p) => {
      if (p.parent !== this) {
        this.addChild(p);
      }
      const nameTag = p.getNameTag().getText();
      if (nameTag.parent !== this.nameTagsContainer) {
        this.nameTagsContainer.addChild(nameTag);
      }
    });
  }

  /** 从后端加载敌人配置并初始化游戏 */
  loadEnemies(): void {
    this.loadDefaultEnemies();
  }

  private setupPlayerCallbacks(): void {
    this.players.getAllPlayers().forEach((player) => {
      player.setDeathCallback((victim, killer) => {
        const victimIndex = this.players.findPlayerIndex(victim);
        if (killer) {
          const killerIndex = this.players.findPlayerIndex(killer);
          this.showKillToast(
            killerIndex !== -1
              ? this.players.getPlayerName(killerIndex)
              : "Unknown",
            victimIndex !== -1
              ? this.players.getPlayerName(victimIndex)
              : "Unknown",
            killerIndex !== -1
              ? this.players.getPlayerColor(killerIndex)
              : 0xff0000,
            victimIndex !== -1
              ? this.players.getPlayerColor(victimIndex)
              : 0x888888,
          );
        }
      });
    });
  }
  /** 加载默认敌人配置 */
  private loadDefaultEnemies(): void {
    const playerConfigs: PlayerConfig[] = [
      { name: "小樱", color: 0x4488ff, startX: 0, startY: 300, isAI: false },
      { name: "美月", color: 0xff6644, startX: -250, startY: -150, isAI: true },
      { name: "雪奈", color: 0x44ff44, startX: 250, startY: -150, isAI: true },
      { name: "爱丽丝", color: 0xff44ff, startX: 0, startY: -250, isAI: true },
      {
        name: "莉莉丝",
        color: 0xffff44,
        startX: -300,
        startY: 100,
        isAI: true,
      },
    ];

    this.players = new PlayerManager(playerConfigs);
    this.gameLoop.updatePlayersList(this.players.getAllPlayers());
    this.setupPlayerCallbacks();
    this.addPlayers();
    this.ui.updatePlayerNames(this);
    this.ai.reinitializeAIControllers();
  }

  update(currentTime: number): void {
    this.gameLoop.update(currentTime);
    this.gameRunning = this.gameLoop.isGameRunning();
    const deltaTime = 16;
    this.killToasts.forEach((t) => t.update(deltaTime));
    this.killToasts = this.killToasts.filter((t) => t.isVisible());
    // 处理 players 尚未初始化的情况
    if (this.players) {
      this.players.getAllPlayers().forEach((p) => {
        const nameTag = p.getNameTag().getText();
        nameTag.x = p.x;
        nameTag.y = p.y + 45;
      });
    }
  }

  async start(): Promise<void> {
    this.reset();
    this.ui.updateWeaponText();
    this.gameLoop.setGameRunning(true);
    this.gameLoop.resetTime();
    this.ui.showRoundAnimation(() => this.gameLoop.resetTime());
  }

  reset(): void {
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
    this.players.resetAll();
    this.start();
  }

  restart(): void {
    this.players.resetScores();
    this.currentRound = 1;
    const zeroScores = new Array(this.players.getPlayerCount()).fill(0);
    this.ui.updateScore(zeroScores);
    this.ui.updateRound(1);
    this.reset();
    this.start();
  }

  startNextRoundDelayed(): void {
    setTimeout(() => this.startNextRound(), 2000);
  }

  private onGameOver(): void {
    const aliveFighters = this.players.getAlivePlayers();
    if (aliveFighters.length === 1) {
      const winnerIndex = this.players.findPlayerIndex(aliveFighters[0]);
      if (winnerIndex !== -1) this.players.addScore(winnerIndex);
    }
    this.ui.updateScore(this.players.getAllScores());
    this.startNextRound();
  }

  showKillToast(
    killerName: string,
    victimName: string,
    killerColor: number,
    victimColor: number,
  ): void {
    const killToast = new KillToast();
    killToast.show(killerName, victimName, killerColor, victimColor);
    const container = killToast.getContainer();
    container.x = FightingGame.CONFIG.stageWidth / 2 - 150;
    container.y =
      -FightingGame.CONFIG.stageHeight / 2 +
      60 +
      this.killToasts.filter((t) => t.isVisible()).length * 40;
    this.killToastsContainer.addChild(container);
    this.killToasts.push(killToast);
    this.killHistory.addKill(killerName, victimName, this.currentRound);
  }

  getKillHistory() {
    return this.killHistory.getAllKills();
  }
}
