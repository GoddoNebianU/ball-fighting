import { FightingGame } from "../FightingGame";
import { GameState, StyleConfig } from "../../../../types/game.types";

export interface CharacterConfig {
  name: string;
  series: string;
  personality: string;
  color: number;
  startX: number;
  startY: number;
  style?: StyleConfig; // 角色的风格配置
  messageLength?: number; // 对话长度（字符数），默认 50
}

export interface EnemiesResponse {
  style: string;
  styleName: string;
  characters: CharacterConfig[];
  count: number;
}

export interface AllEnemiesResponse {
  styles: {
    style: string;
    name: string;
    characterCount: number;
  }[];
}

export class GameClient {
  private apiUrl: string;

  constructor(apiUrl: string = "http://localhost:3001") {
    this.apiUrl = apiUrl;
  }

  async getStyleEnemies(styleName: string): Promise<EnemiesResponse | null> {
    try {
      const url = `${this.apiUrl}/api/chat/enemies/${styleName}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async getAllEnemies(): Promise<AllEnemiesResponse | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/chat/enemies`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async switchStyle(styleName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/chat/styles/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleName }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCurrentStyle(): Promise<{
    name: string;
    config: StyleConfig;
  } | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/chat/styles/current`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async generateAIChat(
    game: FightingGame,
    playerName: string,
    playerStyle?: StyleConfig | null,
    messageLength?: number,
  ): Promise<string | null> {
    try {
      const gameState = this.buildGameState(game);
      const killHistory = game.getKillHistory();

      const response = await fetch(`${this.apiUrl}/api/chat/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState,
          playerName,
          killHistory,
          style: playerStyle, // 直接传递 style 对象
          messageLength: messageLength || 50,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const message = data.message.replace(/^"|"$/g, "");
      return message;
    } catch {
      return null;
    }
  }

  private buildGameState(game: FightingGame): GameState {
    const players = game.players.getAllPlayers();

    return {
      mode: game.mode,
      gameRunning: game.gameRunning,
      roundTime: game.roundTime,
      currentRound: game.currentRound,
      players: players.map((player, index) => {
        const weaponState = player.currentWeapon.getState();
        return {
          name: game.players.getPlayerName(index),
          health: player.health,
          maxHealth: 200,
          x: player.x,
          y: player.y,
          isDead: player.isDead,
          currentWeapon: player.currentWeapon.getName(),
          ammo: weaponState.currentAmmo,
          maxAmmo: weaponState.maxAmmo,
          state: player.state,
        };
      }),
      scores: game.players.getAllScores(),
    };
  }

  async clearPlayerQueue(playerName: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/chat/clear-player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
    } catch {
      // 静默失败
    }
  }
}
