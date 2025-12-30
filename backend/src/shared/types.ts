/**
 * 共享游戏类型定义
 * 前后端通用的游戏数据结构
 */

export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  block: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: number;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  currentWeapon: string;
  isDead: boolean;
  state: "idle" | "walk" | "attack" | "block" | "hit";
}

export interface BulletState {
  id: string;
  ownerId: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  knockback: number;
  active: boolean;
}

export interface HealthPackState {
  id: string;
  position: { x: number; y: number };
  healAmount: number;
  spawnTime: number;
  despawnTime: number;
}

export interface GameConfig {
  STAGE_WIDTH: number;
  STAGE_HEIGHT: number;
  PLAYER_RADIUS: number;
  PLAYER_SPEED: number;
  BULLET_SPEED: number;
}

export const GAME_CONFIG: GameConfig = {
  STAGE_WIDTH: 1280,
  STAGE_HEIGHT: 720,
  PLAYER_RADIUS: 25,
  PLAYER_SPEED: 180,
  BULLET_SPEED: 600,
};
