import { Weapon } from "./Weapon";

export class Pistol extends Weapon {
  constructor() {
    super({
      damage: 15,
      range: 400,
      duration: 150,
      cooldown: 600,
      knockback: 10,
      projectile: true,
      projectileSpeed: 800,
    });
  }

  getName(): string {
    return "手枪";
  }
  getMaxAmmo(): number {
    return Infinity;
  }
  getReloadTime(): number {
    return 0;
  }
  hasInfiniteAmmo(): boolean {
    return true;
  }
}

export class MachineGun extends Weapon {
  constructor() {
    super({
      damage: 2,
      range: 500,
      duration: 50,
      cooldown: 100,
      knockback: 25,
      projectile: true,
      projectileSpeed: 1000,
    });
  }

  getName(): string {
    return "机枪";
  }
  getMaxAmmo(): number {
    return 30;
  }
  getReloadTime(): number {
    return 2000;
  }
  hasInfiniteAmmo(): boolean {
    return false;
  }
  canAutoFire(): boolean {
    return true;
  }
}

export class Sniper extends Weapon {
  constructor() {
    super({
      damage: 50,
      range: 800,
      duration: 800,
      cooldown: 5000,
      knockback: 200,
      projectile: true,
      projectileSpeed: 2000,
      penetrating: true,
    });
  }

  getName(): string {
    return "狙击枪";
  }
  getMaxAmmo(): number {
    return 3;
  }
  getReloadTime(): number {
    return 0;
  }
  hasInfiniteAmmo(): boolean {
    return false;
  }
  canAutoFire(): boolean {
    return false;
  }
}
