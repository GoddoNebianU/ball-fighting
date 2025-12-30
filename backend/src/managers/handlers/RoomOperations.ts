/**
 * 房间操作处理器
 * 处理房间创建、加入、离开等操作
 */

import { Server, Socket } from "socket.io";
import type {
  CreateRoomEvent,
  JoinRoomEvent,
  LeaveRoomEvent,
  RoomCreatedEvent,
  RoomJoinedEvent,
  RoomErrorEvent,
} from "../../types";
import { GameRoom } from "../../rooms/GameRoom";

export class RoomOperations {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(
    socket: Socket,
    data: CreateRoomEvent,
    roomId: string,
    playerId: string,
    room: GameRoom,
  ): void {
    // 添加创建者到房间
    const success = room.addPlayer(
      playerId,
      socket.id,
      data.playerConfig,
      true,
    );

    if (!success) {
      const error: RoomErrorEvent = { error: "room_full" };
      socket.emit("room:error", error);
      return;
    }

    // 加入 Socket.io 房间
    socket.join(roomId);

    // 发送创建成功事件
    const response: RoomCreatedEvent = {
      roomId,
      roomName: data.roomName,
      hasPassword: !!data.password,
      playerCount: 1,
      maxPlayers: data.maxPlayers,
      players: room.getPlayersInfo(),
      yourPlayerId: playerId,
      isHost: true,
    };

    socket.emit("room:created", response);

    console.log(`[RoomManager] 房间已创建: ${roomId} (${data.roomName})`);
  }

  public joinRoom(
    socket: Socket,
    data: JoinRoomEvent,
    getRoom: (roomId: string) => GameRoom | undefined,
    generatePlayerId: () => string,
    trackPlayer: (playerId: string, socketId: string, roomId: string) => void,
    isPlayerInRoom: (socketId: string) => boolean,
  ): void {
    const room = getRoom(data.roomId);

    if (!room) {
      const error: RoomErrorEvent = { error: "room_not_found" };
      socket.emit("room:error", error);
      return;
    }

    if (room.hasPassword() && room.getPassword() !== data.password) {
      const error: RoomErrorEvent = { error: "wrong_password" };
      socket.emit("room:error", error);
      return;
    }

    if (isPlayerInRoom(socket.id)) {
      const error: RoomErrorEvent = { error: "already_in_room" };
      socket.emit("room:error", error);
      return;
    }

    if (room.isPlaying()) {
      const error: RoomErrorEvent = { error: "game_already_started" };
      socket.emit("room:error", error);
      return;
    }

    if (room.isFull()) {
      const error: RoomErrorEvent = { error: "room_full" };
      socket.emit("room:error", error);
      return;
    }

    const playerId = generatePlayerId();
    const success = room.addPlayer(
      playerId,
      socket.id,
      data.playerConfig,
      false,
    );

    if (!success) {
      const error: RoomErrorEvent = { error: "room_full" };
      socket.emit("room:error", error);
      return;
    }

    trackPlayer(playerId, socket.id, data.roomId);
    socket.join(data.roomId);

    const playersInfo = room.getPlayersInfo();
    console.log(
      `[RoomManager] 发送玩家列表给 ${playerId}, 共 ${playersInfo.length} 人:`,
      playersInfo.map((p) => `${p.name} (${p.isAI ? "AI" : "Human"})`),
    );

    const response: RoomJoinedEvent = {
      roomId: data.roomId,
      roomName: room.getName(),
      players: playersInfo,
      yourPlayerId: playerId,
      isHost: false,
    };

    socket.emit("room:joined", response);

    // 通知其他玩家
    this.io.to(data.roomId).emit("room:player_joined", {
      playerId,
      playerInfo: room.getPlayerInfo(playerId),
    });

    console.log(`[RoomManager] 玩家 ${playerId} 加入了房间 ${data.roomId}`);
  }

  public leaveRoom(
    socket: Socket,
    data: LeaveRoomEvent,
    socketPlayers: Map<string, string>,
    playerRooms: Map<string, string>,
    removePlayerFromRoom: (playerId: string, socketId: string) => void,
  ): void {
    const playerId = socketPlayers.get(socket.id);
    if (!playerId) return;

    const roomId = playerRooms.get(playerId);
    if (!roomId) return;

    removePlayerFromRoom(playerId, socket.id);

    socket.leave(roomId);

    console.log(`[RoomManager] 玩家 ${playerId} 离开了房间 ${roomId}`);
  }

  public listRooms(socket: Socket, rooms: Map<string, GameRoom>): void {
    const roomList: {
      name: string;
      hasPassword: boolean;
      playerCount: number;
      maxPlayers: number;
      status: "waiting" | "playing" | "finished";
    }[] = [];

    rooms.forEach((room) => {
      roomList.push({
        name: room.getName(),
        hasPassword: room.hasPassword(),
        playerCount: room.getPlayerCount(),
        maxPlayers: room.getMaxPlayers(),
        status: room.getStatus(),
      });
    });

    socket.emit("room:list", { rooms: roomList });
  }
}
