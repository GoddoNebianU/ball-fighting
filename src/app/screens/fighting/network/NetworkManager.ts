/**
 * 网络管理器
 * 管理 Socket.io 连接，处理所有网络事件
 * 单例模式，使用组合模式拆分功能
 */

import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { RoomManager } from "./managers/RoomManager";
import { GameManager } from "./managers/GameManager";

export class NetworkManager {
  // 单例实例
  private static instance: NetworkManager | null = null;

  private connectionManager: NetworkConnectionManager;
  private roomManager: RoomManager;
  private gameManager: GameManager;

  private constructor() {
    this.connectionManager = new NetworkConnectionManager();
    this.roomManager = new RoomManager(this.connectionManager.api);
    this.gameManager = new GameManager(this.connectionManager.api);

    this.connect();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  /**
   * 连接到服务器
   */
  private connect(): void {
    this.connectionManager.connect((event, data) => {
      this.connectionManager.eventManager.emit(event, data);
    });
  }

  /**
   * 注册事件监听器
   */
  on(event: string, handler: (data: unknown) => void): void {
    this.connectionManager.eventManager.on(event, handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler: (data: unknown) => void): void {
    this.connectionManager.eventManager.off(event, handler);
  }

  // ============ Room API ============

  /**
   * 创建房间
   */
  createRoom(config: {
    roomName: string;
    password?: string;
    maxPlayers: number;
    playerConfig: { name: string; color: number };
  }): void {
    this.roomManager.createRoom(config);
  }

  /**
   * 加入房间
   */
  joinRoom(
    roomId: string,
    password: string | undefined,
    playerConfig: { name: string; color: number },
  ): void {
    this.roomManager.joinRoom(roomId, password, playerConfig);
  }

  /**
   * 离开房间
   */
  leaveRoom(): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    if (roomId) {
      this.roomManager.leaveRoom(roomId);
    }
    this.connectionManager.stateManager.clear();
  }

  /**
   * 获取房间列表
   */
  getRoomList(): void {
    this.roomManager.getRoomList();
  }

  /**
   * 开始游戏
   */
  startGame(): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    const playerId = this.connectionManager.stateManager.getLocalPlayerId();
    if (!roomId || !playerId) return;
    this.roomManager.startGame(roomId, playerId);
  }

  /**
   * 重新开始游戏
   */
  restartGame(): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    const playerId = this.connectionManager.stateManager.getLocalPlayerId();
    if (!roomId || !playerId) return;
    this.roomManager.restartGame(roomId, playerId);
  }

  // ============ Game API ============

  /**
   * 发送玩家输入
   */
  sendPlayerInput(
    input: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      attack: boolean;
      block: boolean;
    },
    position: { x: number; y: number },
    rotation: number,
  ): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    const playerId = this.connectionManager.stateManager.getLocalPlayerId();
    if (!roomId || !playerId) return;
    this.gameManager.sendPlayerInput(
      roomId,
      playerId,
      input,
      position,
      rotation,
    );
  }

  /**
   * 发送玩家动作
   */
  sendPlayerAction(action: {
    action: "attack" | "block" | "weapon_switch";
    data?: { weaponIndex?: number; angle?: number };
  }): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    const playerId = this.connectionManager.stateManager.getLocalPlayerId();
    if (!roomId || !playerId) return;
    this.gameManager.sendPlayerAction(roomId, playerId, action);
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(message: string): void {
    const roomId = this.connectionManager.stateManager.getCurrentRoom();
    const playerId = this.connectionManager.stateManager.getLocalPlayerId();
    if (!roomId || !playerId) return;
    this.gameManager.sendChatMessage(roomId, playerId, message);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.connectionManager.disconnect();
  }

  // ============ Getters ============

  get connected(): boolean {
    return this.connectionManager.connected;
  }

  get roomId(): string | null {
    return this.connectionManager.stateManager.getCurrentRoom();
  }

  get playerId(): string | null {
    return this.connectionManager.stateManager.getLocalPlayerId();
  }

  get host(): boolean {
    return this.connectionManager.stateManager.getHost();
  }
}
