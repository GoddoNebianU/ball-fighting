/** 游戏状态和战斗相关事件类型 */

export interface PlayerState {
  id: string;
  name: string;
  color: number;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  currentWeapon: number;
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
  value: number;
  active: boolean;
}

export interface GameStateUpdate {
  roomId: string;
  timestamp: number;
  players: { [playerId: string]: PlayerState };
  bullets: BulletState[];
  healthPacks: HealthPackState[];
}

export interface PlayerDamagedEvent {
  roomId: string;
  targetId: string;
  damage: number;
  newHealth: number;
  attackerId?: string;
  bulletId?: string;
}

export interface PlayerDiedEvent {
  roomId: string;
  playerId: string;
  killerId?: string;
}

export interface BulletSpawnEvent {
  roomId: string;
  bulletId: string;
  ownerId: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  knockback: number;
}

export interface BulletDestroyEvent {
  roomId: string;
  bulletId: string;
}

export interface HealthPackSpawnEvent {
  roomId: string;
  packId: string;
  position: { x: number; y: number };
  value: number;
}

export interface HealthPackConsumedEvent {
  roomId: string;
  packId: string;
  playerId: string;
  value: number;
  newHealth: number;
}

export interface PlayerScoreUpdateEvent {
  roomId: string;
  scores: { [playerId: string]: number };
}
