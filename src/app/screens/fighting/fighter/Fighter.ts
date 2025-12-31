import { Container } from "pixi.js";

import { FighterGraphics } from "./FighterGraphics";
import { FighterPhysics } from "./FighterPhysics";
import { FighterState } from "../types";
import { FighterCombat } from "./FighterCombat";
import { WeaponManager, Weapon } from "../weapons";
import { FighterConfig } from "./FighterConfig";
import { FighterInput } from "./FighterInput";
import { FighterController } from "./FighterController";

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
  public physics: FighterPhysics;
  public combat: FighterCombat;
  public weaponManager: WeaponManager;
  private graphics: FighterGraphics;
  private controller: FighterController;

  constructor(color: number = 0xffffff, weapons?: Weapon[]) {
    super();

    this.combat = new FighterCombat();
    this.physics = new FighterPhysics(this);
    this.graphics = new FighterGraphics(this, color);
    this.weaponManager = new WeaponManager(
      weapons || WeaponManager.createDefaultWeapons(),
    );
    this.inputHandler = new FighterInput(this.combat);
    this.controller = new FighterController(this);

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
      this.controller.updateAttackDirection(
        this.inputHandler.updateAttackDirection(),
      );

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

  public startAttack(): void {
    this.controller.startAttack();
  }

  public takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    this.controller.takeHit(damage, knockback, fromX, fromY, attacker);
  }

  public getCurrentAttack() {
    return this.controller.getCurrentAttack();
  }

  public markHit(): void {
    this.controller.markHit();
  }

  public switchWeapon(): void {
    this.controller.switchWeapon();
  }

  public reset(x: number, y: number): void {
    this.controller.reset(x, y);
  }

  public setFacingDirection(targetX: number, targetY: number): void {
    this.controller.setFacingDirection(targetX, targetY);
  }

  public getCurrentWeaponState() {
    return this.controller.getCurrentWeaponState();
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
