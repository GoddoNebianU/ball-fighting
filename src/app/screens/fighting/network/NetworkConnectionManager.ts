/**
 * 网络连接管理器
 * 处理网络连接的建立和事件路由
 */

import type { RoomCreatedEvent, RoomJoinedEvent } from "./types";
import { NetworkConnection } from "./NetworkConnection";
import { NetworkEvents } from "./NetworkEvents";
import { NetworkAPI } from "./NetworkAPI";
import { EventManager } from "./EventManager";
import { NetworkStateManager } from "./NetworkStateManager";

export class NetworkConnectionManager {
  public readonly connection: NetworkConnection;
  public readonly events: NetworkEvents;
  public readonly api: NetworkAPI;
  public readonly eventManager: EventManager;
  public readonly stateManager: NetworkStateManager;

  constructor() {
    this.connection = new NetworkConnection();
    this.events = new NetworkEvents();
    this.api = new NetworkAPI(null);
    this.eventManager = new EventManager();
    this.stateManager = new NetworkStateManager();
  }

  public connect(onServerEvent: (event: string, data: unknown) => void): void {
    const socket = this.connection.connect(
      () => {
        this.eventManager.emit("network:connected", {
          socketId: this.connection.getSocketId(),
        });
      },
      (reason) => {
        this.eventManager.emit("network:disconnected", { reason });
      },
      (error) => {
        this.eventManager.emit("network:error", { error });
      },
    );

    this.api.updateSocket(socket);

    if (socket) {
      this.events.setupAllEventListeners(socket, (event, data) => {
        // 更新内部状态
        if (event === "room:created") {
          const roomData = data as RoomCreatedEvent;
          this.stateManager.setCurrentRoom(roomData.roomId);
          this.stateManager.setLocalPlayerId(roomData.yourPlayerId);
          this.stateManager.setHost(roomData.isHost);
        } else if (event === "room:joined") {
          const roomData = data as RoomJoinedEvent;
          this.stateManager.setCurrentRoom(roomData.roomId);
          this.stateManager.setLocalPlayerId(roomData.yourPlayerId);
          this.stateManager.setHost(roomData.isHost);
        }
        // 转发给监听器
        onServerEvent(event, data);
      });
    }
  }

  public disconnect(): void {
    this.connection.disconnect();
    this.stateManager.clear();
    this.eventManager.clear();
  }

  public get connected(): boolean {
    return this.connection.getConnected();
  }
}
