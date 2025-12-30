/**
 * 房间管理相关事件类型
 */

// ============ 房间管理事件 ============

export interface CreateRoomEvent {
  roomName: string;
  password?: string;
  maxPlayers: number;
  playerConfig: PlayerConfig;
}

export interface JoinRoomEvent {
  roomId: string;
  password?: string;
  playerConfig: PlayerConfig;
}

export interface LeaveRoomEvent {
  roomId: string;
}

export interface RoomCreatedEvent {
  roomId: string;
  roomName: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
  players: PlayerInfo[];
  yourPlayerId: string;
  isHost: boolean;
}

export interface RoomJoinedEvent {
  roomId: string;
  roomName: string;
  players: PlayerInfo[];
  yourPlayerId: string;
  isHost: boolean;
}

export interface PlayerJoinedEvent {
  playerId: string;
  playerInfo: PlayerInfo;
}

export interface PlayerLeftEvent {
  playerId: string;
}

export interface RoomClosedEvent {
  roomId: string;
  reason: "host_left" | "server_shutdown";
}

export interface RoomErrorEvent {
  error:
    | "room_full"
    | "wrong_password"
    | "room_not_found"
    | "already_in_room"
    | "game_already_started";
}

export interface RoomInfo {
  id: string;
  name: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
}

// ============ 游戏控制事件 ============

export interface StartGameEvent {
  roomId: string;
  playerId: string;
}

export interface RestartGameEvent {
  roomId: string;
  playerId: string;
}

export interface GameStartingEvent {
  roomId: string;
  countdown: number;
}

export interface GameStartedEvent {
  roomId: string;
  startTime: number;
  playerConfigs: PlayerConfig[];
}

export interface GameOverEvent {
  roomId: string;
  winnerId: string;
  winnerName: string;
  scores: { [playerId: string]: number };
}

// ============ 聊天事件 ============

export interface ChatMessageEvent {
  roomId: string;
  playerId: string;
  message: string;
  timestamp: number;
}

export interface ChatBroadcastEvent {
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

// ============ 玩家输入事件 ============

export interface PlayerInputEvent {
  roomId: string;
  playerId: string;
  timestamp: number;
  input: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack: boolean;
    block: boolean;
  };
  position: { x: number; y: number };
  rotation: number;
}

export interface PlayerActionEvent {
  roomId: string;
  playerId: string;
  timestamp: number;
  action: "attack" | "block" | "weapon_switch";
  data?: {
    weaponIndex?: number;
    angle?: number;
  };
}

// ============ 通用类型（需要被其他文件引用） ============

export interface PlayerConfig {
  name: string;
  color: number;
  startX?: number;
  startY?: number;
  isAI?: boolean;
}

export interface PlayerInfo {
  id: string;
  name: string;
  color: number;
  isAI: boolean;
  isHost: boolean;
  score: number;
  currentWeapon: number;
  health: number;
  position: { x: number; y: number };
}
