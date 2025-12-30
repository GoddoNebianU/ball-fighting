/**
 * 游戏房间
 * 管理单个房间的玩家、游戏循环、状态同步
 */

import { Server } from "socket.io";
import type { PlayerConfig } from "../types";
import { RoomPlayerManager } from "./managers/RoomPlayerManager";
import { RoomGameLoop as RoomGameLoopManager } from "./managers/RoomGameLoop";
import { RoomCombat } from "./managers/RoomCombat";
import { RoomGameController } from "./controllers/RoomGameController";
import { RoomUpdateLoop } from "./controllers/RoomGameLoop";
import { RoomStateBroadcaster } from "./controllers/RoomStateBroadcaster";

export class GameRoom {
  private id: string;
  private name: string;
  private password: string | undefined;
  private maxPlayers: number;
  private io: Server;

  private playerManager: RoomPlayerManager;
  private gameLoopManager: RoomGameLoopManager;
  private combat: RoomCombat;
  private gameController: RoomGameController;
  private updateLoop: RoomUpdateLoop;
  private stateBroadcaster: RoomStateBroadcaster;

  constructor(
    id: string,
    name: string,
    password: string | undefined,
    maxPlayers: number,
    io: Server,
  ) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.maxPlayers = maxPlayers;
    this.io = io;

    this.playerManager = new RoomPlayerManager(maxPlayers);
    this.gameLoopManager = new RoomGameLoopManager();
    this.combat = new RoomCombat();

    // 初始化控制器
    this.gameController = new RoomGameController(
      id,
      maxPlayers,
      io,
      this.playerManager,
      () => this.startGameLoop(),
      () => this.handleGameEnd(),
    );

    this.stateBroadcaster = new RoomStateBroadcaster(
      id,
      io,
      this.playerManager,
      this.combat,
    );

    this.updateLoop = new RoomUpdateLoop(
      id,
      io,
      this.playerManager,
      this.gameLoopManager,
      this.combat,
      () => this.checkGameOver(),
    );

    console.log(`[GameRoom] 房间已创建: ${id}`);
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getPassword(): string | undefined {
    return this.password;
  }

  public getMaxPlayers(): number {
    return this.maxPlayers;
  }

  public getStatus(): "waiting" | "playing" | "finished" {
    return this.gameController.getStatus();
  }

  public addPlayer(
    playerId: string,
    socketId: string,
    config: PlayerConfig,
    isHost: boolean,
  ): boolean {
    return this.playerManager.addPlayer(playerId, socketId, config, isHost);
  }

  public removePlayer(playerId: string): void {
    this.playerManager.removePlayer(playerId);

    // 如果房间为空，标记为已销毁
    if (this.playerManager.isEmpty()) {
      this.stopGameLoop();
      this.gameController.setStatus("finished");
      console.log(`[GameRoom] 房间已销毁: ${this.id}`);
    }
  }

  public startGame(): void {
    this.gameController.startGame();
  }

  private startGameLoop(): void {
    console.log(`[GameRoom] ${this.id} 启动游戏循环`);
    this.updateLoop.start(
      () => {}, // onUpdate callback (empty, game loop handles updates)
      () =>
        this.stateBroadcaster.broadcastGameState(
          this.gameController.getRoundTime(),
        ),
    );
  }

  private stopGameLoop(): void {
    this.updateLoop.stop();
  }

  private checkGameOver(): void {
    const alivePlayers = this.playerManager.getAlivePlayers();

    // 只剩一个玩家存活，游戏结束
    if (alivePlayers.length <= 1 && this.playerManager.getSize() > 1) {
      const winner = alivePlayers[0];
      this.gameController.endGame(winner?.id || "");
    }
  }

  private handleGameEnd(): void {
    this.stopGameLoop();
    this.gameController.setStatus("finished");
  }

  public handlePlayerInput(
    playerId: string,
    input: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      attack: boolean;
      block: boolean;
    },
  ): void {
    this.playerManager.updatePlayerInput(playerId, input);
  }

  public getPlayerConfigs() {
    return this.gameController.getPlayerConfigs();
  }

  public getPlayers() {
    return this.playerManager.getAllPlayers();
  }

  public getPlayersInfo() {
    return this.playerManager.getAllPlayers().map((p) => ({
      id: p.id,
      name: p.config.name,
      color: p.config.color,
      isAI: p.config.isAI || false,
      isHost: p.isHost,
      score: p.score,
      currentWeapon: p.currentWeapon,
      health: p.health,
      position: { x: p.x, y: p.y },
    }));
  }

  public getPlayerInfo(playerId: string) {
    const player = this.playerManager.getPlayer(playerId);
    if (!player) return null;
    return {
      id: player.id,
      name: player.config.name,
      color: player.config.color,
      isAI: player.config.isAI || false,
      isHost: player.isHost,
      score: player.score,
      currentWeapon: player.currentWeapon,
      health: player.health,
      position: { x: player.x, y: player.y },
    };
  }

  public hasPassword(): boolean {
    return !!this.password;
  }

  public isPlaying(): boolean {
    return this.gameController.isPlaying();
  }

  public isFull(): boolean {
    return this.playerManager.getSize() >= this.maxPlayers;
  }

  public isHost(playerId: string): boolean {
    const player = this.playerManager.getPlayer(playerId);
    return player?.isHost || false;
  }

  public restartGame(): void {
    this.gameController.restartGame();
  }

  public handlePlayerAction(playerId: string, action: unknown): void {
    // 暂时不处理动作，只处理输入
    console.log(`[GameRoom] 玩家 ${playerId} 执行动作:`, action);
  }

  public handleChatMessage(playerId: string, message: string): void {
    this.stateBroadcaster.broadcastChatMessage(playerId, message);
  }

  public getPlayerCount(): number {
    return this.playerManager.getSize();
  }

  public destroy(): void {
    this.stopGameLoop();
    this.gameController.setStatus("finished");
    this.combat.clear();
    console.log(`[GameRoom] 房间已销毁: ${this.id}`);
  }
}
