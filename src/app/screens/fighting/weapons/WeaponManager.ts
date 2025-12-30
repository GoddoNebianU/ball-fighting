import { Weapon } from "./Weapon";
import { PunchLight, PunchHeavy } from "./Punch";
import { Pistol, MachineGun, Sniper } from "./Firearm";

/** 武器类型 */
export enum WeaponType {
  PUNCH_LIGHT = "punch_light",
  PUNCH_HEAVY = "punch_heavy",
  PISTOL = "pistol",
  MACHINE_GUN = "machine_gun",
}

/** 武器管理器 - 管理角色的武器切换和状态 */
export class WeaponManager {
  private weapons: Weapon[] = [];
  private currentWeaponIndex: number = 0;

  constructor(weapons: Weapon[]) {
    this.weapons = weapons;
  }

  /** 获取当前武器 */
  public getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }

  /** 获取所有武器 */
  public getAllWeapons(): Weapon[] {
    return [...this.weapons];
  }

  /** 切换武器 */
  public switchWeapon(): void {
    this.currentWeaponIndex =
      (this.currentWeaponIndex + 1) % this.weapons.length;
  }

  /** 设置武器索引 */
  public setWeaponIndex(index: number): void {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  /** 获取当前武器索引 */
  public getCurrentWeaponIndex(): number {
    return this.currentWeaponIndex;
  }

  /** 更新所有武器 */
  public update(deltaTime: number): void {
    for (const weapon of this.weapons) {
      weapon.update(deltaTime);
    }
  }

  /** 重置所有武器 */
  public reset(): void {
    this.currentWeaponIndex = 0;
    for (const weapon of this.weapons) {
      weapon.reset();
    }
  }

  /** 创建默认武器配置 */
  public static createDefaultWeapons(): Weapon[] {
    return [
      new PunchLight(),
      new PunchHeavy(),
      new Pistol(),
      new MachineGun(),
      new Sniper(),
    ];
  }

  /** 创建近战武器配置 */
  public static createMeleeWeapons(): Weapon[] {
    return [new PunchLight(), new PunchHeavy()];
  }

  /** 创建枪械武器配置 */
  public static createFirearmWeapons(): Weapon[] {
    return [new Pistol(), new MachineGun()];
  }
}
