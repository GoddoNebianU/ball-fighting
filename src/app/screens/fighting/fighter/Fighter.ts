import { Container } from "pixi.js";

import { FighterGraphics } from "./FighterGraphics";
import { FighterPhysics } from "./FighterPhysics";
import { FighterState } from "../types";
import { FighterCombat } from "./FighterCombat";
import { WeaponManager, Weapon } from "../weapons";
import { AttackData } from "./FighterTypes";
import { FighterConfig } from "./FighterConfig";
import { FighterInput } from "./FighterInput";

/** 子弹类 */
export { Bullet } from "../combat/Bullet";

/** 角色类 - 俯视角 */
export class Fighter extends Container {
  public static readonly CONFIG = FighterConfig.CONFIG;

  public health: number = Fighter.CONFIG.maxHealth;
  public isDead: boolean = false;
  public lastAttacker: Fighter | null = null;

  private inputHandler: FighterInput;

  // 子系统
  private physics: FighterPhysics;
  private graphics: FighterGraphics;
  public combat: FighterCombat;
  public weaponManager: WeaponManager;

  constructor(color: number = 0xffffff, weapons?: Weapon[]) {
    super();

    this.combat = new FighterCombat();
    this.physics = new FighterPhysics(this);
    this.graphics = new FighterGraphics(this, color);
    this.weaponManager = new WeaponManager(
      weapons || WeaponManager.createDefaultWeapons(),
    );
    this.inputHandler = new FighterInput(this.combat);

    this.addChild(this.graphics.container);
  }

  public get input() {
    return this.inputHandler.input;
  }

  // 公开状态访问
  public get state(): FighterState {
    return this.combat.state;
  }

  public set state(value: FighterState) {
    this.combat.state = value;
  }

  public get attackAngle(): number {
    return this.combat.attackAngle;
  }

  public set attackAngle(value: number) {
    this.combat.attackAngle = value;
  }

  public get currentWeapon(): Weapon {
    return this.weaponManager.getCurrentWeapon();
  }

  public get currentAttack(): Weapon | null {
    if (!this.combat.isAttacking) return null;
    return this.currentWeapon;
  }

  public update(deltaTime: number): void {
    this.weaponManager.update(deltaTime);
    this.combat.updateAttack(deltaTime);

    if (this.combat.canAct) {
      this.updateAttackDirection();
      this.physics.update(deltaTime);

      const currentWeaponData = this.currentWeapon.getData();
      const isProjectileAttack = currentWeaponData.projectile;

      const canAttack =
        !this.combat.isAttacking ||
        (isProjectileAttack &&
          this.currentWeapon.canAutoFire() &&
          this.combat.cooldownTimer <= 0);

      if (canAttack && this.input.attackLight) {
        this.startAttack();
      }

      this.combat.setBlock(this.input.block);
    }

    this.graphics.update();
  }

  private updateAttackDirection(): void {
    const { dx, dy } = this.inputHandler.updateAttackDirection();

    if (dx !== 0 || dy !== 0) {
      this.rotation = this.combat.attackAngle;
    }
  }

  public startAttack(): void {
    const weapon = this.currentWeapon;
    const weaponData = weapon.getData();

    if (!weapon.shoot()) {
      return;
    }

    this.combat.startAttackFromWeapon(weaponData);
  }

  public takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    const actualDamage =
      this.combat.state === FighterState.BLOCK ? damage * 0.2 : damage;
    this.health -= actualDamage;

    if (attacker && !attacker.isDead && actualDamage > 0) {
      this.lastAttacker = attacker;
    }

    if (this.health <= 0 && !this.isDead) {
      this.health = 0;
      this.isDead = true;
      console.log(`Fighter died! Remaining health: 0`);
    }

    const velocities = this.combat.takeHit(
      damage,
      knockback,
      fromX,
      fromY,
      this.x,
      this.y,
      this.physics.velocityX,
      this.physics.velocityY,
    );

    this.physics.velocityX = velocities.vx;
    this.physics.velocityY = velocities.vy;
  }

  public getCurrentAttack(): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    return this.combat.getCurrentAttack();
  }

  public markHit(): void {
    this.combat.markHit();
  }

  public switchWeapon(): void {
    this.weaponManager.switchWeapon();
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.health = Fighter.CONFIG.maxHealth;
    this.isDead = false;
    this.lastAttacker = null;
    this.physics.reset();
    this.combat.reset(x);
    this.weaponManager.reset();
    this.rotation = this.combat.attackAngle;
    this.visible = true;
  }

  public setFacingDirection(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      this.combat.attackAngle = Math.atan2(dy, dx);
      this.rotation = this.combat.attackAngle;
    }
  }

  public getCurrentWeaponState() {
    return this.currentWeapon.getState();
  }

  get velocityX() {
    return this.physics.velocityX;
  }

  set velocityX(value: number) {
    this.physics.velocityX = value;
  }

  get velocityY() {
    return this.physics.velocityY;
  }

  set velocityY(value: number) {
    this.physics.velocityY = value;
  }
}
