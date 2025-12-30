/**
 * 网络对战游戏包装器
 * 适配 FightingGame 支持多人网络对战
 */

import { Container } from "pixi.js";
import { FightingStage } from "../ui/FightingStage";
import { NetworkManager } from "./NetworkManager";
import { RemoteFighter } from "./RemoteFighter";
import { RemoteBullet } from "./RemoteBullet";
import { NetworkInputHandler } from "./NetworkInputHandler";
import { NetworkGameEventHandler } from "./NetworkGameEventHandler";
import type { GameOverEvent } from "./types";

export class NetworkFightingGame extends Container {
  private stage: FightingStage | null = null;
  private networkManager: NetworkManager;
  private players: Map<string, RemoteFighter> = new Map();
  private remoteBullets: Map<string, RemoteBullet> = new Map();
  private localPlayerId: string | null = null;
  private inputHandler: NetworkInputHandler;
  private eventHandler: NetworkGameEventHandler;

  public readonly isNetworkMode: boolean = true;

  constructor() {
    super();

    this.networkManager = NetworkManager.getInstance();
    this.inputHandler = new NetworkInputHandler();

    // 创建舞台（在初始化时就创建，而不是等到游戏开始）
    this.stage = new FightingStage();
    this.addChild(this.stage.container);

    this.eventHandler = new NetworkGameEventHandler(
      this.networkManager,
      this.players,
      this.remoteBullets,
      this.stage.container, // 直接使用舞台容器
      this.localPlayerId,
    );

    this.setup();
  }

  private setup(): void {
    this.inputHandler.setup();

    this.eventHandler.setup(
      () => this.startNetworkGame(),
      (data) => this.handleGameOver(data),
    );

    if (this.networkManager.playerId && this.networkManager.roomId) {
      console.log("[NetworkFightingGame] 检测到已在房间中，手动触发游戏开始");
      setTimeout(() => {
        this.startNetworkGame();
      }, 100);
    }
  }

  private startNetworkGame(): void {
    console.log("[NetworkFightingGame] 开始网络对战（服务器权威模式）");

    this.localPlayerId = this.networkManager?.playerId || null;
    console.log("[NetworkFightingGame] 本地玩家 ID:", this.localPlayerId);

    console.log("[NetworkFightingGame] 战场已创建，等待服务器同步玩家状态");
  }

  private handleGameOver(data: GameOverEvent): void {
    console.log("[NetworkFightingGame] 游戏结束", data);
    console.log(`[NetworkFightingGame] 游戏结束！获胜者: ${data.winnerName}`);
  }

  public update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _currentTime: number,
  ): void {
    if (this.networkManager && this.localPlayerId) {
      const localPlayer = this.players.get(this.localPlayerId);
      if (localPlayer && !localPlayer.isDead) {
        this.networkManager.sendPlayerInput(
          this.inputHandler.getInput(),
          { x: localPlayer.x, y: localPlayer.y },
          localPlayer.rotation,
        );
      }
    }

    this.players.forEach((player) => {
      player.updateInterpolation();
    });

    this.remoteBullets.forEach((bullet) => {
      bullet.updateInterpolation();
    });
  }

  public destroy(): void {
    this.inputHandler.cleanup();

    this.players.forEach((player) => {
      this.removeChild(player);
    });
    this.players.clear();

    this.remoteBullets.forEach((bullet) => {
      bullet.destroy();
      this.removeChild(bullet);
    });
    this.remoteBullets.clear();
  }
}
