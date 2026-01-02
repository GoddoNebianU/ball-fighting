import { ChatMessage } from "../../../src/types/game.types";

/** 对话历史管理器 - 保存最近的对话记录 */
export class ChatHistoryService {
  private messages: ChatMessage[] = [];
  private maxMessages = 5; // 最多保存5条消息，节省token

  /** 添加新消息 */
  public addMessage(playerName: string, message: string): void {
    const chatMessage: ChatMessage = {
      playerName,
      message,
      timestamp: Date.now(),
    };

    this.messages.push(chatMessage);

    // 保持消息队列长度
    if (this.messages.length > this.maxMessages) {
      this.messages.shift(); // 移除最旧的消息
    }
  }

  /** 获取最近的对话历史 */
  public getRecentMessages(): ChatMessage[] {
    return [...this.messages]; // 返回副本
  }

  /** 清空历史 */
  public clear(): void {
    this.messages = [];
  }

  /** 获取消息数量 */
  public get count(): number {
    return this.messages.length;
  }
}

// 全局单例
export const chatHistory = new ChatHistoryService();
