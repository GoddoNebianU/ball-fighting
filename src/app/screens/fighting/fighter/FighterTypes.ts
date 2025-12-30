/** 攻击类型 */
export enum AttackType {
  PUNCH_LIGHT = "punch_light",
  PUNCH_HEAVY = "punch_heavy",
  PISTOL = "pistol",
  MACHINE_GUN = "machine_gun",
}

/** 攻击数据 */
export interface AttackData {
  damage: number;
  range: number;
  duration: number;
  cooldown: number;
  knockback: number;
  projectile?: boolean;
  projectileSpeed?: number;
}

/** 攻击配置 */
export const ATTACK_CONFIG: Record<AttackType, AttackData> = {
  [AttackType.PUNCH_LIGHT]: {
    damage: 8,
    range: 50,
    duration: 200,
    cooldown: 300,
    knockback: 15,
  },
  [AttackType.PUNCH_HEAVY]: {
    damage: 18,
    range: 60,
    duration: 400,
    cooldown: 700,
    knockback: 35,
  },
  [AttackType.PISTOL]: {
    damage: 15,
    range: 400,
    duration: 150,
    cooldown: 600,
    knockback: 10,
    projectile: true,
    projectileSpeed: 800,
  },
  [AttackType.MACHINE_GUN]: {
    damage: 4,
    range: 500,
    duration: 80,
    cooldown: 250,
    knockback: 8,
    projectile: true,
    projectileSpeed: 1000,
  },
};
