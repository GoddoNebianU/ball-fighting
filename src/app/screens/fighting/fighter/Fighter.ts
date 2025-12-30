import { Container } from "pixi.js";

import { FighterGraphics } from "./FighterGraphics";
import { FighterPhysics } from "./FighterPhysics";
import { FighterState } from "../types";
import { FighterCombat } from "./FighterCombat";
import { WeaponManager, Weapon } from "../weapons";
import { FighterConfig } from "./FighterConfig";
import { FighterInput } from "./FighterInput";
import { FighterActions } from "./FighterActions";
import { FighterStateManager } from "./FighterStateManager";

export { Bullet } from "../combat/Bullet";

export class Fighter extends Container {
  public static readonly CONFIG = FighterConfig.CONFIG;

  public health: number = Fighter.CONFIG.maxHealth;
  public isDead: boolean = false;
  public lastAttacker: Fighter | null = null;
  public id: string = "";
  public name: string = "";

  private inputHandler: FighterInput;
  private physics: FighterPhysics;
  public graphics: FighterGraphics;
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
        FighterActions.startAttack(this);
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
    FighterActions.startAttack(this);
  }

  public takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    FighterActions.takeHit(this, damage, knockback, fromX, fromY, attacker);
  }

  public getCurrentAttack() {
    return FighterStateManager.getCurrentAttack(this);
  }

  public markHit(): void {
    FighterStateManager.markHit(this);
  }

  public switchWeapon(): void {
    FighterStateManager.switchWeapon(this);
  }

  public reset(x: number, y: number): void {
    FighterStateManager.reset(this, x, y);
  }

  public setFacingDirection(targetX: number, targetY: number): void {
    FighterActions.setFacingDirection(this, targetX, targetY);
  }

  public getCurrentWeaponState() {
    return FighterStateManager.getCurrentWeaponState(this);
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
