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

export interface KillRecord {
  killerName: string;
  victimName: string;
  timestamp: number;
  roundNumber: number;
}

/** 风格配置 */
export interface StyleConfig {
  name: string;
  description: string;
  systemPrompt: string;
  style: string;
  templates: string[];
}
