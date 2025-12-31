import { GameState } from "../../../src/types/game.types";

interface ZhipuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class ZhipuService {
  private apiKey: string;
  private apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ZHIPU_API_KEY is not defined in environment variables");
    }
  }

  async generateChatMessage(
    gameState: GameState,
    playerName?: string,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(gameState, playerName);

    const messages: ZhipuMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "glm-4-air",
          messages: messages,
          temperature: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`智谱API调用失败: ${response.status}`);
      }

      const data = (await response.json()) as ZhipuResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("智谱API调用错误:", error);
      throw error;
    }
  }

  private buildSystemPrompt(): string {
    return `你是一个格斗游戏的AI角色。你会根据当前游戏状态生成简短的对话消息。

对话风格要求：
- 简短有力，不超过10个汉字
- 可以是挑衅、嘲讽、欢呼、感叹等
- 根据自己的血量和战况说话
- 血量低时可能求饶或愤怒
- 血量高时可能挑衅
- 获胜时欢呼
- 失败时找借口

示例对话：
- "来打我啊！"
- "太弱了！"
- "我不会输的！"
- "好险！"
- "再来！"
- "你不行！"
- "hello"
- "哈哈哈！"
- "放马过来！"

只返回对话内容本身，不要加任何解释或引号。`;
  }

  private buildUserPrompt(gameState: GameState, playerName?: string): string {
    const player = playerName
      ? gameState.players.find((p) => p.name === playerName)
      : gameState.players[0];

    if (!player) {
      return `当前游戏状态：${gameState.players.length}名玩家正在战斗。生成一句对话。`;
    }

    const healthPercent = ((player.health / player.maxHealth) * 100).toFixed(0);
    const alivePlayers = gameState.players.filter((p) => !p.isDead).length;
    const playerIndex = gameState.players.indexOf(player);
    const myScore = gameState.scores[playerIndex];

    // 分析其他玩家状态
    const otherPlayers = gameState.players.filter(
      (p) => p.name !== player.name,
    );
    const nearestEnemy = otherPlayers.find((p) => !p.isDead);
    const highestScore = Math.max(...gameState.scores);
    const isWinning = myScore === highestScore && myScore > 0;
    const isLosing = myScore < highestScore && highestScore > 0;

    // 计算与最近敌人的距离
    let distanceInfo = "";
    if (nearestEnemy) {
      const dx = player.x - nearestEnemy.x;
      const dy = player.y - nearestEnemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      distanceInfo = `\n最近敌人距离：${distance.toFixed(0)}`;
    }

    // 状态描述
    let statusDesc = "";
    if (player.state === "HIT") {
      statusDesc = "（正在受击）";
    } else if (player.state === "ATTACK") {
      statusDesc = "（正在攻击）";
    } else if (player.state === "BLOCK") {
      statusDesc = "（正在格挡）";
    }

    // 弹药情况
    let ammoInfo = "";
    if (
      player.ammo !== undefined &&
      player.maxAmmo !== undefined &&
      player.maxAmmo < 100
    ) {
      const ammoPercent = ((player.ammo / player.maxAmmo) * 100).toFixed(0);
      ammoInfo = `\n弹药：${player.ammo}/${player.maxAmmo} (${ammoPercent}%)`;
      if (player.ammo === 0) {
        ammoInfo += "（弹药用尽！）";
      }
    }

    // 血量数值（用于比较）
    const healthValue = parseFloat(healthPercent);

    return `【游戏状态分析】
我是${player.name}${statusDesc}
当前血量：${healthPercent}%
武器：${player.currentWeapon}${ammoInfo}
场上存活：${alivePlayers}/${gameState.players.length}人
回合：${gameState.currentRound}/${gameState.roundTime}秒
我的得分：${myScore}（${isWinning ? "领先" : isLosing ? "落后" : "平局"}）${distanceInfo}

【局势判断】
${healthValue > 70 ? "血量充足，占据优势" : healthValue > 30 ? "血量一般，需要谨慎" : "血量危急，形势严峻"}
${alivePlayers === 1 ? "我是唯一幸存者！" : alivePlayers === 2 ? "只剩一个对手了！" : `还有${alivePlayers - 1}个对手`}
${isWinning ? "目前领先，保持势头" : isLosing ? "落后了，需要反击" : "势均力敌"}

根据以上信息生成一句简短的对话（不超过10个字）。`;
  }
}
