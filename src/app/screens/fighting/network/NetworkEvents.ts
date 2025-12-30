/**
 * 网络事件监听器设置
 * 处理所有 Socket.io 事件的监听
 */

import { Socket } from "socket.io-client";
import type {
  RoomCreatedEvent,
  RoomJoinedEvent,
  RoomErrorEvent,
  RoomInfo,
  GameStartingEvent,
  GameStartedEvent,
  GameStateUpdate,
  PlayerDiedEvent,
  GameOverEvent,
  ChatBroadcastEvent,
} from "./types";

type EventHandler = (event: string, data: unknown) => void;

export class NetworkEvents {
  private setupRoomEvents(socket: Socket, emit: EventHandler): void {
    socket.on("room:created", (data: RoomCreatedEvent) => {
      emit("room:created", data);
    });

    socket.on("room:joined", (data: RoomJoinedEvent) => {
      emit("room:joined", data);
    });

    socket.on("room:error", (data: RoomErrorEvent) => {
      console.error("[NetworkManager] 房间错误:", data.error);
      emit("room:error", data);
    });

    socket.on("room:player_joined", (data) => {
      console.log("[NetworkManager] 玩家已加入:", data.playerInfo.name);
      emit("room:player_joined", data);
    });

    socket.on("room:player_left", (data) => {
      console.log("[NetworkManager] 玩家已离开:", data.playerId);
      emit("room:player_left", data);
    });

    socket.on("room:list", (data: { rooms: RoomInfo[] }) => {
      emit("room:list", data);
    });
  }

  private setupGameControlEvents(socket: Socket, emit: EventHandler): void {
    socket.on("game:starting", (data: GameStartingEvent) => {
      console.log("[NetworkManager] 游戏即将开始:", data.countdown);
      emit("game:starting", data);
    });

    socket.on("game:started", (data: GameStartedEvent) => {
      console.log("[NetworkManager] 游戏已开始");
      emit("game:started", data);
    });

    socket.on("game:over", (data: GameOverEvent) => {
      console.log("[NetworkManager] 游戏已结束:", data.winnerName);
      emit("game:over", data);
    });
  }

  private setupGameStateEvents(socket: Socket, emit: EventHandler): void {
    socket.on("game:state_update", (data: GameStateUpdate) => {
      emit("game:state_update", data);
    });

    socket.on("game:player_damaged", (data) => {
      emit("game:player_damaged", data);
    });

    socket.on("game:player_died", (data: PlayerDiedEvent) => {
      console.log("[NetworkManager] 玩家已死亡:", data.playerId);
      emit("game:player_died", data);
    });

    socket.on("game:bullet_spawn", (data) => {
      emit("game:bullet_spawn", data);
    });

    socket.on("game:bullet_destroy", (data) => {
      emit("game:bullet_destroy", data);
    });

    socket.on("game:health_pack_spawn", (data) => {
      emit("game:health_pack_spawn", data);
    });

    socket.on("game:health_pack_consumed", (data) => {
      emit("game:health_pack_consumed", data);
    });

    socket.on("game:player_score_update", (data) => {
      emit("game:player_score_update", data);
    });
  }

  private setupChatEvents(socket: Socket, emit: EventHandler): void {
    socket.on("chat:broadcast", (data: ChatBroadcastEvent) => {
      emit("chat:message", data);
    });
  }

  public setupAllEventListeners(socket: Socket, emit: EventHandler): void {
    this.setupRoomEvents(socket, emit);
    this.setupGameControlEvents(socket, emit);
    this.setupGameStateEvents(socket, emit);
    this.setupChatEvents(socket, emit);
  }
}
