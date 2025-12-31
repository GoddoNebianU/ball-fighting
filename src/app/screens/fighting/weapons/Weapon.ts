/** 武器数据接口 */
export interface WeaponData {
  damage: number;
  range: number;
  duration: number;
  cooldown: number;
  knockback: number;
  projectile?: boolean;
  projectileSpeed?: number;
  penetrating?: boolean; // 是否穿透（狙击枪等）
}

/** 武器状态 */
export interface WeaponState {
  currentAmmo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number; // 0-1
}

/** 武器基类 */
export abstract class Weapon {
  protected data: WeaponData;
  protected currentAmmo: number;
  protected reloadTimer: number = 0;
  protected cooldownTimer: number = 0;

  constructor(data: WeaponData) {
    this.data = data;
    this.currentAmmo = this.getMaxAmmo();
  }

  /** 获取武器数据 */
  public getData(): WeaponData {
    return this.data;
  }

  /** 获取武器名称 */
  public abstract getName(): string;

  /** 获取最大弹药量 */
  public abstract getMaxAmmo(): number;

  /** 获取换弹时间 */
  public abstract getReloadTime(): number;

  /** 是否有无限弹药 */
  public abstract hasInfiniteAmmo(): boolean;

  /** 是否可以连发 */
  public canAutoFire(): boolean {
    return false;
  }

  /** 射击 */
  public shoot(): boolean {
    if (this.cooldownTimer > 0) {
      return false;
    }

    if (!this.hasInfiniteAmmo()) {
      if (this.currentAmmo <= 0 || this.reloadTimer > 0) {
        return false;
      }
      this.currentAmmo--;

      // 弹药耗尽,自动换弹(只有换弹时间大于0时才自动换弹)
      if (this.currentAmmo <= 0 && this.getReloadTime() > 0) {
        this.reloadTimer = this.getReloadTime();
      }
    }

    this.cooldownTimer = this.data.cooldown;
    return true;
  }

  /** 更新 */
  public update(deltaTime: number): void {
    // 更新冷却
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaTime;
    }

    // 更新换弹
    if (this.reloadTimer > 0) {
      this.reloadTimer -= deltaTime;
      if (this.reloadTimer <= 0) {
        // 换弹完成
        this.currentAmmo = this.getMaxAmmo();
      }
    }
  }

  /** 获取武器状态 */
  public getState(): WeaponState {
    return {
      currentAmmo: this.currentAmmo,
      maxAmmo: this.getMaxAmmo(),
      isReloading: this.reloadTimer > 0,
      reloadProgress:
        this.reloadTimer > 0 ? 1 - this.reloadTimer / this.getReloadTime() : 0,
    };
  }

  /** 重置 */
  public reset(): void {
    this.currentAmmo = this.getMaxAmmo();
    this.reloadTimer = 0;
    this.cooldownTimer = 0;
  }

  /** 是否准备好射击 */
  public isReady(): boolean {
    return this.cooldownTimer <= 0 && !this.isReloading();
  }

  /** 是否正在换弹 */
  public isReloading(): boolean {
    return this.reloadTimer > 0;
  }

  /** 手动换弹 */
  public reload(): boolean {
    if (this.reloadTimer > 0 || this.currentAmmo === this.getMaxAmmo()) {
      return false;
    }
    this.reloadTimer = this.getReloadTime();
    return true;
  }
}
