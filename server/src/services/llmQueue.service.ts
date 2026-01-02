import { GameState, ChatMessage, KillRecord } from "../../../src/types/game.types";
import { ZhipuService } from "./zhipu.service";

/** LLM 请求任务 */
interface LLMRequestTask {
  gameState: GameState;
  playerName?: string;
  recentMessages?: ChatMessage[];
  killHistory?: KillRecord[];
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

/** LLM 请求队列服务 - 串行处理请求，避免并发限制 */
export class LLMQueueService {
  private queue: LLMRequestTask[] = [];
  private isProcessing: boolean = false;
  private zhipuService: ZhipuService | null = null;
  private maxQueueSize: number = 10; // 队列最大长度
  private maxWaitTime: number = 30000; // 最大等待时间 30秒

  /** 确保 ZhipuService 已初始化 */
  private ensureService(): void {
    if (!this.zhipuService) {
      this.zhipuService = new ZhipuService();
    }
  }

  /**
   * 添加请求到队列
   * @returns Promise<string> 返回生成的对话内容
   */
  public async enqueue(
    gameState: GameState,
    playerName?: string,
    recentMessages?: ChatMessage[],
    killHistory?: KillRecord[],
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // 检查队列是否已满
      if (this.queue.length >= this.maxQueueSize) {
        console.warn(
          `[LLM队列] 队列已满 (${this.maxQueueSize})，拒绝新请求 - 玩家: ${playerName || "未知"}`,
        );
        reject(new Error("队列已满，请稍后重试"));
        return;
      }

      const task: LLMRequestTask = {
        gameState,
        playerName,
        recentMessages,
        killHistory,
        resolve,
        reject,
      };

      this.queue.push(task);
      console.log(`[LLM队列] 新任务加入队列，当前队列长度: ${this.queue.length}`);

      // 设置超时，如果等待时间过长则拒绝
      const timeoutId = setTimeout(() => {
        const index = this.queue.indexOf(task);
        if (index > -1) {
          this.queue.splice(index, 1);
          console.warn(
            `[LLM队列] 任务超时 (${this.maxWaitTime}ms)，已从队列移除 - 玩家: ${playerName || "未知"}`,
          );
          reject(new Error("请求超时"));
        }
      }, this.maxWaitTime);

      // 保存 timeoutId 以便后续清理（如果任务被处理）
      (task as any).timeoutId = timeoutId;

      // 如果队列处理器空闲，启动处理
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /** 处理队列中的任务 */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log("[LLM队列] 开始处理队列...");

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      console.log(
        `[LLM队列] 处理任务 - 玩家: ${task.playerName || "未知"}, 剩余任务: ${this.queue.length}`,
      );

      // 清理超时定时器
      const timeoutId = (task as any).timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 确保服务已初始化
      this.ensureService();

      try {
        const startTime = Date.now();
        const result = await this.zhipuService!.generateChatMessage(
          task.gameState,
          task.playerName,
          task.recentMessages,
          task.killHistory,
        );
        const duration = Date.now() - startTime;
        console.log(`[LLM队列] 任务完成 - 耗时: ${duration}ms`);
        task.resolve(result);
      } catch (error) {
        console.error("[LLM队列] 任务失败:", error);
        task.reject(error as Error);
      }

      // 添加一个小延迟，避免请求过于密集
      if (this.queue.length > 0) {
        await this.sleep(500); // 等待500ms再处理下一个
      }
    }

    console.log("[LLM队列] 队列处理完成");
    this.isProcessing = false;
  }

  /** 获取当前队列长度 */
  public get queueLength(): number {
    return this.queue.length;
  }

  /** 检查是否正在处理 */
  public get processing(): boolean {
    return this.isProcessing;
  }

  /** 延迟函数 */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** 清空队列 */
  public clear(): void {
    // 拒绝所有等待中的任务
    this.queue.forEach((task) => {
      // 清理超时定时器
      const timeoutId = (task as any).timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      task.reject(new Error("队列已清空"));
    });
    this.queue = [];
    console.log("[LLM队列] 队列已清空");
  }

  /** 清空指定玩家的队列任务 */
  public clearPlayerTasks(playerName: string): void {
    const initialLength = this.queue.length;
    // 过滤掉该玩家的任务
    this.queue = this.queue.filter((task) => {
      if (task.playerName === playerName) {
        // 清理超时定时器
        const timeoutId = (task as any).timeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // 拒绝该任务
        task.reject(new Error(`玩家 ${playerName} 死亡，取消队列任务`));
        return false; // 从队列中移除
      }
      return true; // 保留其他任务
    });

    const removedCount = initialLength - this.queue.length;
    if (removedCount > 0) {
      console.log(
        `[LLM队列] 已移除玩家 "${playerName}" 的 ${removedCount} 个任务`,
      );
    }
  }
}

// 全局单例
export const llmQueue = new LLMQueueService();
