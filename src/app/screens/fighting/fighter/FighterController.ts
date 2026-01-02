import { Fighter } from "./Fighter";
import { FighterState } from "../types";
import { AttackData } from "./FighterTypes";

export type DeathCallback = (victim: Fighter, killer: Fighter | null) => void;

export class FighterController {
  private fighter: Fighter;
  private onDeathCallback?: DeathCallback;

  constructor(fighter: Fighter) {
    this.fighter = fighter;
  }

  setDeathCallback(callback: DeathCallback): void {
    this.onDeathCallback = callback;
  }

  updateAttackDirection(input: { dx: number; dy: number }): void {
    const { dx, dy } = input;
    if (dx !== 0 || dy !== 0)
      this.fighter.rotation = this.fighter.combat.attackAngle;
  }

  startAttack(): void {
    const weapon = this.fighter.currentWeapon;
    if (weapon.shoot())
      this.fighter.combat.startAttackFromWeapon(weapon.getData());
  }

  takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    const actualDamage =
      this.fighter.state === FighterState.BLOCK ? damage * 0.2 : damage;
    this.fighter.health -= actualDamage;
    if (attacker && !attacker.isDead && actualDamage > 0)
      this.fighter.lastAttacker = attacker;
    if (this.fighter.health <= 0 && !this.fighter.isDead) {
      this.fighter.health = 0;
      this.fighter.isDead = true;
      console.log("Fighter died! Remaining health: 0");
      if (this.onDeathCallback)
        this.onDeathCallback(this.fighter, this.fighter.lastAttacker);
    }
    const velocities = this.fighter.combat.takeHit(
      damage,
      knockback,
      fromX,
      fromY,
      this.fighter.x,
      this.fighter.y,
      this.fighter.physics.velocityX,
      this.fighter.physics.velocityY,
    );
    this.fighter.physics.velocityX = velocities.vx;
    this.fighter.physics.velocityY = velocities.vy;
  }

  getCurrentAttack(): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    return this.fighter.combat.getCurrentAttack();
  }

  markHit(): void {
    this.fighter.combat.markHit();
  }
  switchWeapon(): void {
    this.fighter.weaponManager.switchWeapon();
  }

  reset(x: number, y: number): void {
    this.fighter.x = x;
    this.fighter.y = y;
    this.fighter.health = Fighter.CONFIG.maxHealth;
    this.fighter.isDead = false;
    this.fighter.lastAttacker = null;
    this.fighter.physics.reset();
    this.fighter.combat.reset(x);
    this.fighter.weaponManager.reset();
    this.fighter.rotation = this.fighter.combat.attackAngle;
    this.fighter.visible = true;
  }

  setFacingDirection(targetX: number, targetY: number): void {
    const dx = targetX - this.fighter.x,
      dy = targetY - this.fighter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      this.fighter.combat.attackAngle = Math.atan2(dy, dx);
      this.fighter.rotation = this.fighter.combat.attackAngle;
    }
  }

  getCurrentWeaponState() {
    return this.fighter.currentWeapon.getState();
  }
}
