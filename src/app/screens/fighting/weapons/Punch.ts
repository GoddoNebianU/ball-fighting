import { Weapon } from "./Weapon";

/** 轻拳武器 */
export class PunchLight extends Weapon {
  constructor() {
    super({
      damage: 15,
      range: 70,
      duration: 300,
      cooldown: 1200,
      knockback: 80,
    });
  }

  public getName(): string {
    return "轻拳";
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

/** 重拳武器 */
export class PunchHeavy extends Weapon {
  constructor() {
    super({
      damage: 25,
      range: 80,
      duration: 500,
      cooldown: 3000,
      knockback: 120,
    });
  }

  public getName(): string {
    return "重拳";
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
