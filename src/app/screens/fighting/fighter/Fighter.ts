import { Container } from "pixi.js";
import { FighterGraphics } from "./FighterGraphics";
import { FighterPhysics } from "./FighterPhysics";
import { FighterState } from "../types";
import { FighterCombat } from "./FighterCombat";
import { WeaponManager, Weapon } from "../weapons";
import { FighterConfig } from "./FighterConfig";
import { FighterInput } from "./FighterInput";
import { FighterController } from "./FighterController";

export { Bullet } from "../combat/Bullet";

export class Fighter extends Container {
  static readonly CONFIG = FighterConfig.CONFIG;
  health = Fighter.CONFIG.maxHealth;
  isDead = false;
  lastAttacker: Fighter | null = null;
  name: string;

  private inputHandler: FighterInput;
  physics: FighterPhysics;
  combat: FighterCombat;
  weaponManager: WeaponManager;
  private graphics: FighterGraphics;
  private controller: FighterController;

  constructor(name: string, color = 0xffffff, weapons?: Weapon[]) {
    super();
    this.name = name;
    this.combat = new FighterCombat();
    this.physics = new FighterPhysics(this);
    this.graphics = new FighterGraphics(this, color, name);
    this.weaponManager = new WeaponManager(
      weapons || WeaponManager.createDefaultWeapons(),
    );
    this.inputHandler = new FighterInput(this.combat);
    this.controller = new FighterController(this);
    this.addChild(this.graphics.container);
  }

  get input() {
    return this.inputHandler.input;
  }
  get state(): FighterState {
    return this.combat.state;
  }
  set state(value: FighterState) {
    this.combat.state = value;
  }
  get attackAngle(): number {
    return this.combat.attackAngle;
  }
  set attackAngle(value: number) {
    this.combat.attackAngle = value;
  }
  get currentWeapon(): Weapon {
    return this.weaponManager.getCurrentWeapon();
  }
  get currentAttack(): Weapon | null {
    return this.combat.isAttacking ? this.currentWeapon : null;
  }

  update(deltaTime: number): void {
    this.weaponManager.update(deltaTime);
    this.combat.updateAttack(deltaTime);
    if (this.combat.canAct) {
      this.controller.updateAttackDirection(
        this.inputHandler.updateAttackDirection(),
      );
      this.physics.update(deltaTime);
      const weaponData = this.currentWeapon.getData();
      const canAttack =
        !this.combat.isAttacking ||
        (weaponData.projectile &&
          this.currentWeapon.canAutoFire() &&
          this.combat.cooldownTimer <= 0);
      if (canAttack && this.input.attackLight) this.startAttack();
      this.combat.setBlock(this.input.block);
    }
    this.graphics.update();
  }

  startAttack() {
    this.controller.startAttack();
  }
  takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ) {
    this.controller.takeHit(damage, knockback, fromX, fromY, attacker);
  }
  getCurrentAttack() {
    return this.controller.getCurrentAttack();
  }
  markHit() {
    this.controller.markHit();
  }
  switchWeapon() {
    this.controller.switchWeapon();
  }
  reset(x: number, y: number) {
    this.controller.reset(x, y);
  }
  setFacingDirection(targetX: number, targetY: number) {
    this.controller.setFacingDirection(targetX, targetY);
  }
  getCurrentWeaponState() {
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

  showSpeech(message: string) {
    this.graphics.showSpeech(message);
  }
  getSpeechBubble() {
    return this.graphics.getSpeechBubble();
  }
  getNameTag() {
    return this.graphics.getNameTag();
  }
  setDeathCallback(
    callback: (victim: Fighter, killer: Fighter | null) => void,
  ) {
    this.controller.setDeathCallback(callback);
  }
}
