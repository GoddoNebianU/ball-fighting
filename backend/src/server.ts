/**
 * 多人格斗游戏服务器
 * Express + Socket.io
 */

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { RoomManager } from "./managers/RoomManager";
import {
  CreateRoomEvent,
  JoinRoomEvent,
  LeaveRoomEvent,
  StartGameEvent,
  RestartGameEvent,
  PlayerInputEvent,
  PlayerActionEvent,
  ChatMessageEvent,
} from "./types";

const app = express();

// 启用 CORS
app.use(cors());
app.use(express.json());

// 创建 HTTP 服务器
const httpServer = createServer(app);

// 创建 Socket.io 服务器
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// 创建房间管理器
const roomManager = new RoomManager(io);

// Socket.io 连接处理
io.on("connection", (socket: Socket) => {
  console.log(`[Server] 客户端已连接: ${socket.id}`);

  // ============ 房间管理事件 ============

  // 创建房间
  socket.on("room:create", (data: CreateRoomEvent) => {
    console.log(`[Server] 收到创建房间请求: ${data.roomName}`);
    roomManager.createRoom(socket, data);
  });

  // 加入房间
  socket.on("room:join", (data: JoinRoomEvent) => {
    console.log(`[Server] 收到加入房间请求: ${data.roomId}`);
    roomManager.joinRoom(socket, data);
  });

  // 离开房间
  socket.on("room:leave", (data: LeaveRoomEvent) => {
    console.log(`[Server] 收到离开房间请求: ${data.roomId}`);
    roomManager.leaveRoom(socket, data);
  });

  // 获取房间列表
  socket.on("room:list", () => {
    console.log("[Server] 收到获取房间列表请求");
    roomManager.listRooms(socket);
  });

  // ============ 游戏控制事件 ============

  // 开始游戏
  socket.on("game:start", (data: StartGameEvent) => {
    console.log(`[Server] 收到开始游戏请求: ${data.roomId}`);
    roomManager.startGame(socket, data);
  });

  // 重新开始游戏
  socket.on("game:restart", (data: RestartGameEvent) => {
    console.log(`[Server] 收到重新开始游戏请求: ${data.roomId}`);
    roomManager.restartGame(socket, data);
  });

  // ============ 玩家输入事件 ============

  // 玩家输入（移动、攻击、格挡）
  socket.on("player:input", (data: PlayerInputEvent) => {
    // 不打印每帧的输入，避免日志过多
    roomManager.handlePlayerInput(socket, data);
  });

  // 玩家动作（换武器等）
  socket.on("player:action", (data: PlayerActionEvent) => {
    roomManager.handlePlayerAction(socket, data);
  });

  // ============ 聊天事件 ============

  socket.on("chat:message", (data: ChatMessageEvent) => {
    console.log(`[Server] 收到聊天消息: ${data.message}`);
    roomManager.handleChatMessage(socket, data);
  });

  // ============ 断开连接 ============

  socket.on("disconnect", () => {
    console.log(`[Server] 客户端已断开: ${socket.id}`);
    roomManager.handleDisconnect(socket);
  });

  socket.on("error", (error) => {
    console.error(`[Server] Socket 错误: ${socket.id}`, error);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log("=================================");
  console.log("🎮 多人格斗游戏服务器");
  console.log("=================================");
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`📍 WebSocket: ws://localhost:${PORT}`);
  console.log(`📍 HTTP API: http://localhost:${PORT}`);
  console.log("=================================");
});

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("[Server] 收到 SIGTERM 信号，正在关闭服务器...");
  httpServer.close(() => {
    console.log("[Server] 服务器已关闭");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[Server] 收到 SIGINT 信号，正在关闭服务器...");
  httpServer.close(() => {
    console.log("[Server] 服务器已关闭");
    process.exit(0);
  });
});
