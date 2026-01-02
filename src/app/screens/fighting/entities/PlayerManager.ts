import { Fighter } from "../fighter/Fighter";
import { StyleConfig } from "../../../../types/game.types";

export interface PlayerConfig {
  name: string;
  color: number;
  startX: number;
  startY: number;
  isAI: boolean;
  style?: StyleConfig; // 角色的风格配置
  messageLength?: number; // 对话长度（字符数），默认 50
}

export class PlayerManager {
  private players: Fighter[];
  private scores: number[] = [];
  private configs: PlayerConfig[];

  constructor(configs: PlayerConfig[]) {
    this.configs = configs;
    this.players = configs.map((config) => {
      const color =
        typeof config.color === "string"
          ? parseInt(config.color, 10)
          : config.color;
      return new Fighter(config.name, color >>> 0);
    });
    this.scores = new Array(configs.length).fill(0);
    this.resetAll();
  }

  getAllPlayers(): Fighter[] {
    return this.players;
  }
  getAlivePlayers(): Fighter[] {
    return this.players.filter((p) => !p.isDead && p.health > 0);
  }
  getPlayer(index: number): Fighter {
    return this.players[index];
  }
  getPlayerCount(): number {
    return this.players.length;
  }
  getScore(index: number): number {
    return this.scores[index];
  }
  getAllScores(): number[] {
    return [...this.scores];
  }
  addScore(index: number): void {
    this.scores[index]++;
  }
  resetScores(): void {
    this.scores = new Array(this.players.length).fill(0);
  }
  resetAll(): void {
    this.players.forEach((player, index) => {
      player.reset(this.configs[index].startX, this.configs[index].startY);
    });
  }
  findPlayerIndex(player: Fighter): number {
    return this.players.indexOf(player);
  }
  hasSingleSurvivor(): boolean {
    return this.getAlivePlayers().length <= 1;
  }
  getWinner(): Fighter | null {
    const survivors = this.getAlivePlayers();
    return survivors.length === 1 ? survivors[0] : null;
  }
  updateAll(deltaTime: number): void {
    this.players.forEach((player) => {
      if (!player.isDead) player.update(deltaTime);
      else player.visible = false;
    });
  }
  getAIPlayers(): Fighter[] {
    return this.players.filter((_, i) => this.configs[i].isAI);
  }
  getHumanPlayers(): Fighter[] {
    return this.players.filter((_, i) => !this.configs[i].isAI);
  }
  getFirstHumanPlayer(): Fighter | null {
    const humanPlayers = this.getHumanPlayers();
    return humanPlayers.length > 0 ? humanPlayers[0] : null;
  }
  getPlayerName(index: number): string {
    return index >= 0 && index < this.configs.length
      ? this.configs[index].name
      : `P${index + 1}`;
  }
  getAllPlayerNames(): string[] {
    return this.configs.map((c) => c.name);
  }
  getPlayerColor(index: number): number {
    return index >= 0 && index < this.configs.length
      ? (typeof this.configs[index].color === "string"
          ? parseInt(this.configs[index].color as string, 10)
          : this.configs[index].color) >>> 0
      : 0xffffff;
  }
  getAllPlayerColors(): number[] {
    return this.configs.map((c) => {
      const color =
        typeof c.color === "string" ? parseInt(c.color, 10) : c.color;
      return color >>> 0;
    });
  }
  getPlayerStyle(index: number): StyleConfig | null {
    return index >= 0 && index < this.configs.length
      ? this.configs[index].style || null
      : null;
  }
  getPlayerMessageLength(index: number): number {
    return index >= 0 && index < this.configs.length
      ? this.configs[index].messageLength || 50
      : 50;
  }
}
