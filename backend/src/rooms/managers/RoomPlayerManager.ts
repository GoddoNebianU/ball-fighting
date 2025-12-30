/**
 * 房间玩家管理器
 * 处理玩家添加、移除、查询等操作
 */

import type { PlayerConfig, PlayerState } from "../../types";

export interface RoomPlayer {
  id: string;
  socketId: string;
  config: PlayerConfig;
  isHost: boolean;
  score: number;
  health: number;
  x: number;
  y: number;
  rotation: number;
  currentWeapon: number;
  isDead: boolean;
  lastAttackTime?: number;
  input: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack: boolean;
    block: boolean;
  };
}

export class RoomPlayerManager {
  private players: Map<string, RoomPlayer> = new Map();
  private maxPlayers: number;
  private readonly PLAYER_RADIUS = 25;
  private readonly STAGE_WIDTH = 1200;
  private readonly STAGE_HEIGHT = 800;
  private readonly MAX_HEALTH = 200;

  constructor(maxPlayers: number) {
    this.maxPlayers = maxPlayers;
  }

  public addPlayer(
    playerId: string,
    socketId: string,
    config: PlayerConfig,
    isHost: boolean,
  ): boolean {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    const player: RoomPlayer = {
      id: playerId,
      socketId,
      config,
      isHost,
      score: 0,
      health: this.MAX_HEALTH,
      x: config.startX || 0,
      y: config.startY || 0,
      rotation: 0,
      currentWeapon: 0,
      isDead: false,
      input: {
        up: false,
        down: false,
        left: false,
        right: false,
        attack: false,
        block: false,
      },
    };

    this.players.set(playerId, player);
    console.log(`[GameRoom] 玩家已加入: ${playerId} (${config.name})`);
    return true;
  }

  public removePlayer(playerId: string): void {
    this.players.delete(playerId);
    console.log(`[GameRoom] 玩家已移除: ${playerId}`);
  }

  public getPlayer(playerId: string): RoomPlayer | undefined {
    return this.players.get(playerId);
  }

  public getAllPlayers(): RoomPlayer[] {
    return Array.from(this.players.values());
  }

  public getAlivePlayers(): RoomPlayer[] {
    return this.getAllPlayers().filter((p) => !p.isDead);
  }

  public getHumanPlayerCount(): number {
    return this.getAllPlayers().filter((p) => !p.config.isAI).length;
  }

  public getSize(): number {
    return this.players.size;
  }

  public isEmpty(): boolean {
    return this.players.size === 0;
  }

  public getHostPlayer(): RoomPlayer | undefined {
    return this.getAllPlayers().find((p) => p.isHost);
  }

  public updatePlayerInput(
    playerId: string,
    input: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      attack: boolean;
      block: boolean;
    },
  ): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.input = input;
    return true;
  }

  public updatePlayerPosition(
    playerId: string,
    x: number,
    y: number,
    rotation: number,
  ): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.x = x;
    player.y = y;
    player.rotation = rotation;
  }

  public damagePlayer(
    playerId: string,
    damage: number,
    newHealth: number,
  ): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.health = newHealth;
    if (player.health <= 0) {
      player.isDead = true;
    }
  }

  public resetPlayers(): void {
    this.players.forEach((player) => {
      player.health = this.MAX_HEALTH;
      player.x = player.config.startX || 0;
      player.y = player.config.startY || 0;
      player.rotation = 0;
      player.isDead = false;
      player.input = {
        up: false,
        down: false,
        left: false,
        right: false,
        attack: false,
        block: false,
      };
    });
  }

  public getAllPlayerStates(): Record<string, PlayerState> {
    const states: Record<string, PlayerState> = {};
    this.players.forEach((player, id) => {
      states[id] = {
        id: player.id,
        name: player.config.name,
        color: player.config.color,
        position: { x: player.x, y: player.y },
        rotation: player.rotation,
        health: player.health,
        currentWeapon: player.currentWeapon,
        isDead: player.isDead,
        state: "idle",
      };
    });
    return states;
  }
}
