import { Weapon } from "./Weapon";

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

  getName(): string {
    return "轻拳";
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

  getName(): string {
    return "重拳";
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
