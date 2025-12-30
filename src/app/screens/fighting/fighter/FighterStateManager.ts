import { Fighter } from "./Fighter";
import type { AttackData } from "./FighterTypes";

/** Fighter 状态管理器 */
export class FighterStateManager {
  public static reset(fighter: Fighter, x: number, y: number): void {
    fighter.x = x;
    fighter.y = y;
    fighter.health = Fighter.CONFIG.maxHealth;
    fighter.isDead = false;
    fighter.lastAttacker = null;
    // Reset velocity through public setters
    fighter.velocityX = 0;
    fighter.velocityY = 0;
    fighter.combat.reset(x);
    fighter.weaponManager.reset();
    fighter.rotation = fighter.combat.attackAngle;
    fighter.visible = true;
  }

  public static getCurrentAttack(fighter: Fighter): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    return fighter.combat.getCurrentAttack();
  }

  public static markHit(fighter: Fighter): void {
    fighter.combat.markHit();
  }

  public static switchWeapon(fighter: Fighter): void {
    fighter.weaponManager.switchWeapon();
  }

  public static getCurrentWeaponState(fighter: Fighter) {
    return fighter.currentWeapon.getState();
  }
}
