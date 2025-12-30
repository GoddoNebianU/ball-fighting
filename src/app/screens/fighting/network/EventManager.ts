/**
 * 事件管理器
 * 处理事件监听器的注册、移除和触发
 */

type EventHandler = (data: unknown) => void;

export class EventManager {
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  public on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public emit(event: string, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[EventManager] 事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  public clear(): void {
    this.eventHandlers.clear();
  }
}
