import { GameState, ChatMessage, KillRecord } from "../../../src/types/game.types";
import { ZhipuService } from "./zhipu.service";

/** LLM 请求任务 */
interface LLMRequestTask {
  gameState: GameState;
  playerName?: string;
  recentMessages?: ChatMessage[];
  killHistory?: KillRecord[];
  messageLength?: number;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

/** LLM 请求队列服务 - 并发处理请求 */
export class LLMQueueService {
  private queue: LLMRequestTask[] = [];
  private activeCount: number = 0; // 当前活跃的任务数
  private maxConcurrency: number = 4; // 最大并发数
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
    messageLength?: number,
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
        messageLength,
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

      // 尝试启动处理任务
      this.processQueue();
    });
  }

  /** 处理队列中的任务 */
  private async processQueue(): Promise<void> {
    // 当还有任务且未达到并发限制时，启动新任务
    while (this.queue.length > 0 && this.activeCount < this.maxConcurrency) {
      const task = this.queue.shift();
      if (!task) break;

      this.activeCount++;
      console.log(
        `[LLM队列] 处理任务 - 玩家: ${task.playerName || "未知"}, 活跃任务: ${this.activeCount}/${this.maxConcurrency}, 剩余任务: ${this.queue.length}`,
      );

      // 清理超时定时器
      const timeoutId = (task as any).timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 异步处理任务
      this.processTask(task);
    }
  }

  /** 处理单个任务 */
  private async processTask(task: LLMRequestTask): Promise<void> {
    // 确保服务已初始化
    this.ensureService();

    try {
      const startTime = Date.now();
      const result = await this.zhipuService!.generateChatMessage(
        task.gameState,
        task.playerName,
        task.recentMessages,
        task.killHistory,
        task.messageLength,
      );
      const duration = Date.now() - startTime;
      console.log(`[LLM队列] 任务完成 - 耗时: ${duration}ms`);
      task.resolve(result);
    } catch (error) {
      console.error("[LLM队列] 任务失败:", error);
      task.reject(error as Error);
    } finally {
      this.activeCount--;
      // 尝试处理下一个任务
      this.processQueue();
    }
  }

  /** 获取当前队列长度 */
  public get queueLength(): number {
    return this.queue.length;
  }

  /** 获取当前活跃任务数 */
  public get activeTasks(): number {
    return this.activeCount;
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
