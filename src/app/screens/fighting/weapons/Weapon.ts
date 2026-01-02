export interface WeaponData {
  damage: number;
  range: number;
  duration: number;
  cooldown: number;
  knockback: number;
  projectile?: boolean;
  projectileSpeed?: number;
  penetrating?: boolean;
}

export interface WeaponState {
  currentAmmo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
}

export abstract class Weapon {
  protected data: WeaponData;
  protected currentAmmo: number;
  protected reloadTimer = 0;
  protected cooldownTimer = 0;

  constructor(data: WeaponData) {
    this.data = data;
    this.currentAmmo = this.getMaxAmmo();
  }

  getData(): WeaponData {
    return this.data;
  }
  abstract getName(): string;
  abstract getMaxAmmo(): number;
  abstract getReloadTime(): number;
  abstract hasInfiniteAmmo(): boolean;

  canAutoFire(): boolean {
    return false;
  }

  shoot(): boolean {
    if (this.cooldownTimer > 0) return false;
    if (!this.hasInfiniteAmmo()) {
      if (this.currentAmmo <= 0 || this.reloadTimer > 0) return false;
      this.currentAmmo--;
      if (this.currentAmmo <= 0 && this.getReloadTime() > 0)
        this.reloadTimer = this.getReloadTime();
    }
    this.cooldownTimer = this.data.cooldown;
    return true;
  }

  update(deltaTime: number): void {
    if (this.cooldownTimer > 0) this.cooldownTimer -= deltaTime;
    if (this.reloadTimer > 0) {
      this.reloadTimer -= deltaTime;
      if (this.reloadTimer <= 0) this.currentAmmo = this.getMaxAmmo();
    }
  }

  getState(): WeaponState {
    return {
      currentAmmo: this.currentAmmo,
      maxAmmo: this.getMaxAmmo(),
      isReloading: this.reloadTimer > 0,
      reloadProgress:
        this.reloadTimer > 0 ? 1 - this.reloadTimer / this.getReloadTime() : 0,
    };
  }

  reset(): void {
    this.currentAmmo = this.getMaxAmmo();
    this.reloadTimer = 0;
    this.cooldownTimer = 0;
  }

  isReady(): boolean {
    return this.cooldownTimer <= 0 && !this.isReloading();
  }
  isReloading(): boolean {
    return this.reloadTimer > 0;
  }
  reload(): boolean {
    if (this.reloadTimer > 0 || this.currentAmmo === this.getMaxAmmo())
      return false;
    this.reloadTimer = this.getReloadTime();
    return true;
  }
}
