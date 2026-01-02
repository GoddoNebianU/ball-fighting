/**
 * 智谱AI服务 - 负责调用智谱API生成游戏对话
 * 职责：API调用、配置管理
 */

import { GameState, ChatMessage, KillRecord } from "../../../src/types/game.types";
import { buildSystemPrompt } from "./prompts/system.prompt";
import { UserPromptBuilder } from "./prompts/user.prompt";
import { ZhipuMessage, ZhipuResponse } from "./prompts/types";

export class ZhipuService {
  private apiKey: string;
  private apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ZHIPU_API_KEY is not defined in environment variables");
    }
  }

  /**
   * 生成AI对话消息
   * @param gameState 游戏状态
   * @param playerName 玩家名称（可选）
   * @param recentMessages 最近对话历史（可选）
   * @param killHistory 击杀历史（可选）
   * @returns 生成的对话内容
   */
  async generateChatMessage(
    gameState: GameState,
    playerName?: string,
    recentMessages?: ChatMessage[],
    killHistory?: KillRecord[],
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = new UserPromptBuilder(
      gameState,
      playerName,
      recentMessages,
      killHistory,
    ).build();

    const messages: ZhipuMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    try {
      const response = await this.callZhipuAPI(messages);

      if (!response.ok) {
        throw new Error(`智谱API调用失败: ${response.status}`);
      }

      const data = (await response.json()) as ZhipuResponse;
      return this.extractResponseContent(data);
    } catch (error) {
      console.error("智谱API调用错误:", error);
      throw error;
    }
  }

  /**
   * 调用智谱API
   */
  private async callZhipuAPI(messages: ZhipuMessage[]): Promise<Response> {
    return await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "glm-4.7",
        messages: messages,
        temperature: 1.0,
        thinking: { type: "disabled" }
      }),
    });
  }

  /**
   * 从API响应中提取对话内容
   */
  private extractResponseContent(data: ZhipuResponse): string {
    return data.choices[0].message.content;
  }
}
