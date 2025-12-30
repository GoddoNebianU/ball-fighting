/**
 * 房间管理器
 * 负责协调各个处理器，管理房间的创建、删除、查询
 */

import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { GameRoom } from "../rooms/GameRoom";
import { RoomOperations } from "./handlers/RoomOperations";
import { GameControls } from "./handlers/GameControls";
import { PlayerTracker } from "./handlers/PlayerTracker";
import type {
  CreateRoomEvent,
  JoinRoomEvent,
  LeaveRoomEvent,
  StartGameEvent,
  RestartGameEvent,
  PlayerInputEvent,
  PlayerActionEvent,
  ChatMessageEvent,
  RoomInfo,
} from "../types";

export class RoomManager {
  private io: Server;
  private rooms: Map<string, GameRoom> = new Map();
  private roomOperations: RoomOperations;
  private gameControls: GameControls;
  private playerTracker: PlayerTracker;

  constructor(io: Server) {
    this.io = io;
    this.roomOperations = new RoomOperations(io);
    this.gameControls = new GameControls(io);
    this.playerTracker = new PlayerTracker(io);
  }

  public createRoom(socket: Socket, data: CreateRoomEvent): void {
    const roomId = this.generateRoomId();
    const playerId = this.generatePlayerId();

    const room = new GameRoom(
      roomId,
      data.roomName,
      data.password,
      data.maxPlayers,
      this.io,
    );

    this.rooms.set(roomId, room);

    this.roomOperations.createRoom(socket, data, roomId, playerId, room);
    this.playerTracker.trackPlayer(playerId, socket.id, roomId);

    this.broadcastRoomList();

    console.log(`[RoomManager] 房间已创建: ${roomId} (${data.roomName})`);
  }

  public joinRoom(socket: Socket, data: JoinRoomEvent): void {
    this.roomOperations.joinRoom(
      socket,
      data,
      (roomId) => this.rooms.get(roomId),
      () => this.generatePlayerId(),
      (playerId, socketId, roomId) =>
        this.playerTracker.trackPlayer(playerId, socketId, roomId),
      (socketId) => this.playerTracker.isPlayerInRoom(socketId),
    );

    this.broadcastRoomList();

    const playerId = this.playerTracker.getPlayerId(socket.id);
    console.log(`[RoomManager] 玩家 ${playerId} 加入了房间 ${data.roomId}`);
  }

  public leaveRoom(
    socket: Socket,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: LeaveRoomEvent,
  ): void {
    const playerId = this.playerTracker.getPlayerId(socket.id);
    if (!playerId) return;

    const roomId = this.playerTracker.getRoomId(playerId);
    if (!roomId) return;

    socket.leave(roomId);

    this.playerTracker.removePlayerFromRoom(
      playerId,
      socket.id,
      (roomId) => this.rooms.get(roomId),
      (roomId) => this.rooms.delete(roomId),
      () => this.broadcastRoomList(),
    );

    console.log(`[RoomManager] 玩家 ${playerId} 离开了房间 ${roomId}`);
  }

  public startGame(socket: Socket, data: StartGameEvent): void {
    this.gameControls.startGame(
      socket,
      data,
      (roomId) => this.rooms.get(roomId),
      (socketId) => this.playerTracker.getPlayerId(socketId),
    );
  }

  public restartGame(socket: Socket, data: RestartGameEvent): void {
    this.gameControls.restartGame(
      socket,
      data,
      (roomId) => this.rooms.get(roomId),
      (socketId) => this.playerTracker.getPlayerId(socketId),
    );
  }

  public handlePlayerInput(socket: Socket, data: PlayerInputEvent): void {
    this.gameControls.handlePlayerInput(socket, data, (roomId) =>
      this.rooms.get(roomId),
    );
  }

  public handlePlayerAction(socket: Socket, data: PlayerActionEvent): void {
    this.gameControls.handlePlayerAction(socket, data, (roomId) =>
      this.rooms.get(roomId),
    );
  }

  public handleChatMessage(socket: Socket, data: ChatMessageEvent): void {
    this.gameControls.handleChatMessage(socket, data, (roomId) =>
      this.rooms.get(roomId),
    );
  }

  public handleDisconnect(socket: Socket): void {
    this.playerTracker.handleDisconnect(
      socket,
      (roomId) => this.rooms.get(roomId),
      (roomId) => this.rooms.delete(roomId),
      () => this.broadcastRoomList(),
    );
  }

  public listRooms(socket: Socket): void {
    const rooms: RoomInfo[] = [];

    this.rooms.forEach((room, roomId) => {
      rooms.push({
        id: roomId,
        name: room.getName(),
        hasPassword: room.hasPassword(),
        playerCount: room.getPlayerCount(),
        maxPlayers: room.getMaxPlayers(),
        status: room.getStatus(),
      });
    });

    socket.emit("room:list", { rooms });
  }

  private broadcastRoomList(): void {
    const rooms: RoomInfo[] = [];

    this.rooms.forEach((room, roomId) => {
      rooms.push({
        id: roomId,
        name: room.getName(),
        hasPassword: room.hasPassword(),
        playerCount: room.getPlayerCount(),
        maxPlayers: room.getMaxPlayers(),
        status: room.getStatus(),
      });
    });

    this.io.emit("room:list", { rooms });
  }

  private generateRoomId(): string {
    return `room_${uuidv4().substring(0, 8)}`;
  }

  private generatePlayerId(): string {
    return `player_${uuidv4().substring(0, 8)}`;
  }
}
