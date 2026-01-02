/**
 * 用户Prompt构建器 - 根据游戏状态动态生成用户prompt
 */

import { GameState, ChatMessage, KillRecord } from "../../../../src/types/game.types";

export class UserPromptBuilder {
  private gameState: GameState;
  private playerName?: string;
  private recentMessages?: ChatMessage[];
  private killHistory?: KillRecord[];

  constructor(
    gameState: GameState,
    playerName?: string,
    recentMessages?: ChatMessage[],
    killHistory?: KillRecord[],
  ) {
    this.gameState = gameState;
    this.playerName = playerName;
    this.recentMessages = recentMessages;
    this.killHistory = killHistory;
  }

  /**
   * 构建完整的用户prompt
   */
  public build(): string {
    const player = this.getPlayer();
    if (!player) {
      return this.buildFallbackPrompt();
    }

    return `【状态】我是${player.name}，血量${((player.health / player.maxHealth) * 100).toFixed(0)}%，武器${player.currentWeapon}
【时间】第${this.gameState.currentRound}回合，剩${this.gameState.roundTime}秒
【对手】${this.buildEnemiesInfo(player)}
${this.buildChatHistory()}
${this.buildKillHistory()}
${this.buildSituation(player)}

生成对话（15-30字），必须@开头！`;
  }

  private getPlayer() {
    return this.playerName
      ? this.gameState.players.find((p) => p.name === this.playerName)
      : this.gameState.players[0];
  }

  private buildEnemiesInfo(player: any): string {
    const enemies = this.gameState.players
      .filter((p) => !p.isDead && p.name !== player.name)
      .map((p) => {
        const hp = ((p.health / p.maxHealth) * 100).toFixed(0);
        return `${p.name}(血${hp}%)`;
      })
      .join("、");
    return enemies || "无";
  }

  private buildChatHistory(): string {
    if (!this.recentMessages?.length) return "";
    const now = Date.now();
    const history = this.recentMessages
      .map((m) => `${m.playerName}: ${m.message} (${Math.floor((now - m.timestamp) / 1000)}秒前)`)
      .join("\n");
    return `【对话】\n${history}`;
  }

  private buildKillHistory(): string {
    if (!this.killHistory?.length) return "";
    const now = Date.now();
    const kills = this.killHistory
      .slice(-3)
      .map((k) => `${k.killerName}➔${k.victimName} (${Math.floor((now - k.timestamp) / 1000)}秒前)`)
      .join(" | ");
    return `【击杀】${kills}`;
  }

  private buildSituation(player: any): string {
    const hp = ((player.health / player.maxHealth) * 100);
    const idx = this.gameState.players.indexOf(player);
    const score = this.gameState.scores[idx];
    const alive = this.gameState.players.filter((p) => !p.isDead).length;

    let status = "";
    if (hp > 70) status = "🔥优势";
    else if (hp < 30) status = "💀劣势嘴硬";
    else status = "⚠️均势";

    if (alive === 2) status += " | ⚔️决战";
    else if (alive > 3) status += ` | 👥混战(${alive}人)`;

    return `【局势】${status} | 得分:${score}`;
  }

  private buildFallbackPrompt(): string {
    return `当前${this.gameState.players.length}名玩家战斗中。生成对话。`;
  }
}
