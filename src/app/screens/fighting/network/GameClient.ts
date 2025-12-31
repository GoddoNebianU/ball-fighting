import { FightingGame } from "../FightingGame";
import { GameState } from "../../../../types/game.types";

/** 游戏客户端 - 调用后端API生成对话 */
export class GameClient {
  private apiUrl: string;

  constructor(apiUrl: string = "http://localhost:3001") {
    this.apiUrl = apiUrl;
  }

  /** 生成AI对话 */
  async generateAIChat(
    game: FightingGame,
    playerName: string,
  ): Promise<string | null> {
    try {
      const gameState = this.buildGameState(game);

      const response = await fetch(`${this.apiUrl}/api/chat/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameState, playerName }),
      });

      if (!response.ok) {
        console.error(`API调用失败: ${response.status}`);
        return null;
      }

      const data = await response.json();
      // 移除可能的引号
      const message = data.message.replace(/^"|"$/g, "");
      return message;
    } catch (error) {
      console.error("生成对话失败:", error);
      return null;
    }
  }

  /** 构建游戏状态对象 */
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
          maxHealth: 200, // Fighter.CONFIG.maxHealth
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
}
