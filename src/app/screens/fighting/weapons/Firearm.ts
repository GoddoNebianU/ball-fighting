import { Weapon } from "./Weapon";

/** 手枪武器 */
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

  public getName(): string {
    return "手枪";
  }

  public getMaxAmmo(): number {
    return Infinity;
  }

  public getReloadTime(): number {
    return 0;
  }

  public hasInfiniteAmmo(): boolean {
    return true;
  }
}

/** 机枪武器 */
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

  public getName(): string {
    return "机枪";
  }

  public getMaxAmmo(): number {
    return 30;
  }

  public getReloadTime(): number {
    return 2000; // 2秒换弹
  }

  public hasInfiniteAmmo(): boolean {
    return false;
  }

  public canAutoFire(): boolean {
    return true; // 机枪可以连发
  }
}

/** 狙击枪武器 */
export class Sniper extends Weapon {
  constructor() {
    super({
      damage: 50,
      range: 800,
      duration: 800,
      cooldown: 5000, // 5秒冷却
      knockback: 200,
      projectile: true,
      projectileSpeed: 2000,
      penetrating: true, // 狙击枪可以穿透多个目标
    });
  }

  public getName(): string {
    return "狙击枪";
  }

  public getMaxAmmo(): number {
    return 3; // 每回合3发
  }

  public getReloadTime(): number {
    return 0; // 不自动换弹
  }

  public hasInfiniteAmmo(): boolean {
    return false;
  }

  public canAutoFire(): boolean {
    return false; // 狙击枪不能连发
  }
}
