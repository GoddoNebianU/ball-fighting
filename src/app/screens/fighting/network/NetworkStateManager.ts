/**
 * 网络状态管理器
 * 管理 NetworkManager 的内部状态（房间ID、玩家ID、主机状态）
 */

export class NetworkStateManager {
  private currentRoomId: string | null = null;
  private localPlayerId: string | null = null;
  private isHost: boolean = false;

  public setCurrentRoom(roomId: string | null): void {
    this.currentRoomId = roomId;
  }

  public setLocalPlayerId(playerId: string | null): void {
    this.localPlayerId = playerId;
  }

  public setHost(host: boolean): void {
    this.isHost = host;
  }

  public getCurrentRoom(): string | null {
    return this.currentRoomId;
  }

  public getLocalPlayerId(): string | null {
    return this.localPlayerId;
  }

  public getHost(): boolean {
    return this.isHost;
  }

  public clear(): void {
    this.currentRoomId = null;
    this.localPlayerId = null;
    this.isHost = false;
  }

  public isInRoom(): boolean {
    return this.currentRoomId !== null && this.localPlayerId !== null;
  }
}
