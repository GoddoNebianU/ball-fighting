/**
 * 房间游戏控制器
 * 处理游戏开始、倒计时、结束、AI填充
 */

import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type {
  GameStartingEvent,
  GameStartedEvent,
  GameOverEvent,
} from "../../types";
import { RoomPlayerManager } from "../managers/RoomPlayerManager";

export class RoomGameController {
  private status: "waiting" | "playing" | "finished" = "waiting";
  private roundTime: number = 99;
  private currentRound: number = 1;
  private gameStartTime: number = 0;

  private readonly STAGE_WIDTH = 800;
  private readonly STAGE_HEIGHT = 600;

  constructor(
    private roomId: string,
    private maxPlayers: number,
    private io: Server,
    private playerManager: RoomPlayerManager,
    private onGameStart: () => void,
    private onGameEnd: () => void,
  ) {}

  public getStatus(): "waiting" | "playing" | "finished" {
    return this.status;
  }

  public setStatus(status: "waiting" | "playing" | "finished"): void {
    this.status = status;
  }

  public startGame(): void {
    if (this.status === "playing") return;

    this.fillWithAI();

    // 发送倒计时
    let countdown = 3;
    const event: GameStartingEvent = {
      roomId: this.roomId,
      countdown,
    };
    this.io.to(this.roomId).emit("game:starting", event);

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        event.countdown = countdown;
        this.io.to(this.roomId).emit("game:starting", event);
      } else {
        clearInterval(countdownInterval);
        this.actualStartGame();
      }
    }, 1000);
  }

  private actualStartGame(): void {
    this.status = "playing";
    this.gameStartTime = Date.now();
    this.roundTime = 99;
    this.currentRound = 1;

    // 重置所有玩家状态
    this.playerManager.resetPlayers();

    // 发送游戏开始事件
    const startedEvent: GameStartedEvent = {
      roomId: this.roomId,
      startTime: Date.now(),
      playerConfigs: this.getPlayerConfigs(),
    };
    this.io.to(this.roomId).emit("game:started", startedEvent);

    // 通知开始游戏循环
    this.onGameStart();

    console.log(`[RoomGameController] 游戏已开始: ${this.roomId}`);
  }

  public restartGame(): void {
    this.actualStartGame();
  }

  private fillWithAI(): void {
    const humanCount = this.playerManager.getHumanPlayerCount();
    const aiNeeded = this.maxPlayers - humanCount;

    if (aiNeeded <= 0) return;

    console.log(`[RoomGameController] 已填充 ${aiNeeded} 个 AI`);

    for (let i = 0; i < aiNeeded; i++) {
      const aiId = `ai_${uuidv4()}`;
      const angle = ((humanCount + i) * 2 * Math.PI) / this.maxPlayers;
      const radius = Math.min(this.STAGE_WIDTH, this.STAGE_HEIGHT) * 0.35;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;

      this.playerManager.addPlayer(
        aiId,
        "",
        {
          name: `AI_${Math.floor(Math.random() * 1000)}`,
          color: Math.floor(Math.random() * 0xffffff),
          startX,
          startY,
          isAI: true,
        },
        false,
      );
    }
  }

  public endGame(winnerId: string): void {
    this.status = "finished";

    const winner = this.playerManager.getPlayer(winnerId);
    const scores: { [playerId: string]: number } = {};
    this.playerManager.getAllPlayers().forEach((p) => {
      scores[p.id] = p.score;
    });

    const gameOverEvent: GameOverEvent = {
      roomId: this.roomId,
      winnerId,
      winnerName: winner?.config.name || "Unknown",
      scores,
    };

    this.io.to(this.roomId).emit("game:over", gameOverEvent);
    console.log(
      `[RoomGameController] 游戏已结束: ${this.roomId}, 获胜者: ${winner?.config.name}`,
    );

    this.onGameEnd();
  }

  public getRoundTime(): number {
    return this.roundTime;
  }

  public getPlayerConfigs() {
    return this.playerManager.getAllPlayers().map((p) => ({
      id: p.id,
      name: p.config.name,
      color: p.config.color,
      startX: p.config.startX || 0,
      startY: p.config.startY || 0,
      isAI: p.config.isAI,
    }));
  }

  public isPlaying(): boolean {
    return this.status === "playing";
  }
}
