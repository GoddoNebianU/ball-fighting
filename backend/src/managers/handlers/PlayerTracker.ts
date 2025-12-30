/**
 * 玩家追踪处理器
 * 处理玩家与房间的映射关系、断开连接
 */

import { Server, Socket } from "socket.io";
import { GameRoom } from "../../rooms/GameRoom";

export class PlayerTracker {
  private io: Server;
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId
  private socketPlayers: Map<string, string> = new Map(); // socketId -> playerId

  constructor(io: Server) {
    this.io = io;
  }

  public trackPlayer(playerId: string, socketId: string, roomId: string): void {
    this.playerRooms.set(playerId, roomId);
    this.socketPlayers.set(socketId, playerId);
  }

  public removePlayerFromRoom(
    playerId: string,
    socketId: string,
    getRoom: (roomId: string) => GameRoom | undefined,
    deleteRoom: (roomId: string) => void,
    broadcastRoomList: () => void,
  ): void {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;

    const room = getRoom(roomId);
    if (!room) return;

    const wasHost = room.isHost(playerId);

    // 从房间移除玩家
    room.removePlayer(playerId);

    // 清理映射
    this.playerRooms.delete(playerId);
    this.socketPlayers.delete(socketId);

    // 如果房主离开，解散房间
    if (wasHost) {
      // 通知房间内所有玩家房间已关闭
      this.io.to(roomId).emit("room:closed", {
        roomId,
        reason: "host_left",
      });

      // 清理所有剩余玩家的映射
      room.getPlayersInfo().forEach((player) => {
        if (!player.isAI) {
          this.playerRooms.delete(player.id);
        }
      });

      // 删除房间
      room.destroy();
      deleteRoom(roomId);
      console.log(`[RoomManager] 房间 ${roomId} 已解散（房主离开）`);

      // 广播房间列表更新
      broadcastRoomList();
      return;
    }

    // 通知房间内其他玩家
    this.io.to(roomId).emit("room:player_left", { playerId });

    // 如果房间为空，删除房间
    if (room.getPlayerCount() === 0) {
      room.destroy();
      deleteRoom(roomId);
      console.log(`[RoomManager] 房间 ${roomId} 已删除（无玩家）`);
    }

    // 广播房间列表更新
    broadcastRoomList();
  }

  public handleDisconnect(
    socket: Socket,
    getRoom: (roomId: string) => GameRoom | undefined,
    deleteRoom: (roomId: string) => void,
    broadcastRoomList: () => void,
  ): void {
    const playerId = this.socketPlayers.get(socket.id);
    if (!playerId) return;

    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;

    this.removePlayerFromRoom(
      playerId,
      socket.id,
      getRoom,
      deleteRoom,
      broadcastRoomList,
    );
  }

  public getPlayerId(socketId: string): string | undefined {
    return this.socketPlayers.get(socketId);
  }

  public getRoomId(playerId: string): string | undefined {
    return this.playerRooms.get(playerId);
  }

  public isPlayerInRoom(socketId: string): boolean {
    const playerId = this.socketPlayers.get(socketId);
    return playerId !== undefined && this.playerRooms.has(playerId);
  }

  public clear(): void {
    this.playerRooms.clear();
    this.socketPlayers.clear();
  }
}
