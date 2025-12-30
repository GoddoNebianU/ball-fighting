import { Fighter } from "./Fighter";
import { FighterState } from "../types";

/** Fighter 攻击和受击逻辑 */
export class FighterActions {
  public static startAttack(fighter: Fighter): void {
    const weapon = fighter.currentWeapon;
    const weaponData = weapon.getData();

    if (!weapon.shoot()) {
      return;
    }

    fighter.combat.startAttackFromWeapon(weaponData);
  }

  public static takeHit(
    fighter: Fighter,
    damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    attacker?: Fighter,
  ): void {
    const actualDamage =
      fighter.state === (FighterState.BLOCK as unknown) ? damage * 0.2 : damage;
    fighter.health -= actualDamage;

    if (attacker && !attacker.isDead && actualDamage > 0) {
      fighter.lastAttacker = attacker;
    }

    if (fighter.health <= 0 && !fighter.isDead) {
      fighter.health = 0;
      fighter.isDead = true;
      console.log(`Fighter died! Remaining health: 0`);
    }

    const velocities = fighter.combat.takeHit(
      damage,
      knockback,
      fromX,
      fromY,
      fighter.x,
      fighter.y,
      fighter.velocityX,
      fighter.velocityY,
    );

    fighter.velocityX = velocities.vx;
    fighter.velocityY = velocities.vy;
  }

  public static setFacingDirection(
    fighter: Fighter,
    targetX: number,
    targetY: number,
  ): void {
    const dx = targetX - fighter.x;
    const dy = targetY - fighter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      fighter.combat.attackAngle = Math.atan2(dy, dx);
      fighter.rotation = fighter.combat.attackAngle;
    }
  }
}
