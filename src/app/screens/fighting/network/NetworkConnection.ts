/**
 * Socket.io 连接管理
 * 处理服务器连接、断开、错误
 */

import { io, Socket } from "socket.io-client";

export class NetworkConnection {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private serverUrl: string = "http://localhost:3000";

  public connect(
    onConnect: () => void,
    onDisconnect: (reason: string) => void,
    onError: (error: Error) => void,
  ): Socket | null {
    console.log("[NetworkManager] 正在连接到服务器...");

    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("[NetworkManager] 已连接到服务器");
      onConnect();
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("[NetworkManager] 已断开连接:", reason);
      onDisconnect(reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[NetworkManager] 连接错误:", error);
      onError(error);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getConnected(): boolean {
    return this.isConnected;
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }
}
