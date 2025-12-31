/** 游戏状态类型定义 - 前后端共享 */

export interface FighterState {
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  isDead: boolean;
  currentWeapon: string;
  ammo: number;
  maxAmmo: number;
  state: string; // IDLE, WALK, ATTACK, BLOCK, HIT
}

export interface GameState {
  mode: string;
  gameRunning: boolean;
  roundTime: number;
  currentRound: number;
  players: FighterState[];
  scores: number[];
}

export interface ChatRequest {
  gameState: GameState;
  playerName?: string; // 可选：指定说话的角色名称
  context?: string; // 可选：额外上下文
}

export interface ChatResponse {
  message: string;
  playerName: string;
  timestamp: number;
}
