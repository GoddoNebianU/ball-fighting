import { Fighter } from "./Fighter";
import { FighterState } from "../types";
import { AttackData } from "./FighterTypes";

/** 角色控制器 */
export class FighterController {
  private fighter: Fighter;

  constructor(fighter: Fighter) {
    this.fighter = fighter;
  }

  /** 更新攻击方向 */
  public updateAttackDirection(input: { dx: number; dy: number }): void {
    const { dx, dy } = input;

    if (dx !== 0 || dy !== 0) {
      this.fighter.rotation = this.fighter.combat.attackAngle;
    }
  }

  /** 开始攻击 */
  public startAttack(): void {
    const weapon = this.fighter.currentWeapon;
    const weaponData = weapon.getData();

    if (!weapon.shoot()) {
      return;
    }

    this.fighter.combat.startAttackFromWeapon(weaponData);
  }

  /** 受击 */
  public takeHit(
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    const actualDamage =
      this.fighter.state === FighterState.BLOCK ? damage * 0.2 : damage;
    this.fighter.health -= actualDamage;

    if (attacker && !attacker.isDead && actualDamage > 0) {
      this.fighter.lastAttacker = attacker;
    }

    if (this.fighter.health <= 0 && !this.fighter.isDead) {
      this.fighter.health = 0;
      this.fighter.isDead = true;
      console.log(`Fighter died! Remaining health: 0`);
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

  /** 获取当前攻击信息 */
  public getCurrentAttack(): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    return this.fighter.combat.getCurrentAttack();
  }

  /** 标记已命中 */
  public markHit(): void {
    this.fighter.combat.markHit();
  }

  /** 切换武器 */
  public switchWeapon(): void {
    this.fighter.weaponManager.switchWeapon();
  }

  /** 重置角色 */
  public reset(x: number, y: number): void {
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

  /** 设置面向方向 */
  public setFacingDirection(targetX: number, targetY: number): void {
    const dx = targetX - this.fighter.x;
    const dy = targetY - this.fighter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      this.fighter.combat.attackAngle = Math.atan2(dy, dx);
      this.fighter.rotation = this.fighter.combat.attackAngle;
    }
  }

  /** 获取当前武器状态 */
  public getCurrentWeaponState() {
    return this.fighter.currentWeapon.getState();
  }
}
