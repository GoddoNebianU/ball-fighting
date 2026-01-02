import { Weapon } from "./Weapon";
import { PunchLight, PunchHeavy } from "./Punch";
import { Pistol, MachineGun, Sniper } from "./Firearm";

export enum WeaponType {
  PUNCH_LIGHT = "punch_light",
  PUNCH_HEAVY = "punch_heavy",
  PISTOL = "pistol",
  MACHINE_GUN = "machine_gun",
}

export class WeaponManager {
  private weapons: Weapon[] = [];
  private currentWeaponIndex = 0;

  constructor(weapons: Weapon[]) {
    this.weapons = weapons;
  }

  getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }
  getAllWeapons(): Weapon[] {
    return [...this.weapons];
  }
  switchWeapon(): void {
    this.currentWeaponIndex =
      (this.currentWeaponIndex + 1) % this.weapons.length;
  }
  setWeaponIndex(index: number): void {
    if (index >= 0 && index < this.weapons.length)
      this.currentWeaponIndex = index;
  }
  getCurrentWeaponIndex(): number {
    return this.currentWeaponIndex;
  }
  update(deltaTime: number): void {
    for (const weapon of this.weapons) weapon.update(deltaTime);
  }
  reset(): void {
    this.currentWeaponIndex = 0;
    for (const weapon of this.weapons) weapon.reset();
  }

  static createDefaultWeapons(): Weapon[] {
    return [
      new PunchLight(),
      new PunchHeavy(),
      new Pistol(),
      new MachineGun(),
      new Sniper(),
    ];
  }
  static createMeleeWeapons(): Weapon[] {
    return [new PunchLight(), new PunchHeavy()];
  }
  static createFirearmWeapons(): Weapon[] {
    return [new Pistol(), new MachineGun()];
  }
}
