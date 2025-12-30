/**
 * 共享战斗系统
 * 处理伤害、死亡、武器冷却等
 */

export interface CombatState {
  lastAttackTime: number;
  isAttacking: boolean;
  isBlocking: boolean;
  isHit: boolean;
  hitEndTime: number;
}

export class CombatSystem {
  /**
   * 检查是否可以攻击
   */
  static canAttack(
    combatState: CombatState,
    currentTime: number,
    attackCooldown: number,
  ): boolean {
    if (combatState.isHit) return false;
    if (combatState.isBlocking) return false;

    if (
      combatState.lastAttackTime &&
      currentTime - combatState.lastAttackTime < attackCooldown
    ) {
      return false;
    }

    return true;
  }

  /**
   * 执行攻击
   */
  static performAttack(
    combatState: CombatState,
    currentTime: number,
  ): CombatState {
    return {
      ...combatState,
      lastAttackTime: currentTime,
      isAttacking: true,
    };
  }

  /**
   * 计算伤害
   */
  static calculateDamage(
    baseDamage: number,
    attackerIsBlocking: boolean,
    victimIsBlocking: boolean,
  ): number {
    let damage = baseDamage;

    // 如果攻击者在格挡，伤害减半
    if (attackerIsBlocking) {
      damage = Math.floor(damage * 0.5);
    }

    // 如果受害者在格挡，伤害减半
    if (victimIsBlocking) {
      damage = Math.floor(damage * 0.5);
    }

    return damage;
  }

  /**
   * 处理受击
   */
  static handleHit(
    combatState: CombatState,
    hitStunDuration: number,
  ): CombatState {
    return {
      ...combatState,
      isHit: true,
      hitEndTime: Date.now() + hitStunDuration,
      isAttacking: false,
      isBlocking: false,
    };
  }

  /**
   * 更新战斗状态
   */
  static updateCombatState(
    combatState: CombatState,
    currentTime: number,
    input: {
      attack: boolean;
      block: boolean;
    },
  ): CombatState {
    // 检查受击眩晕是否结束
    if (combatState.isHit) {
      if (currentTime > combatState.hitEndTime) {
        return {
          ...combatState,
          isHit: false,
          hitEndTime: 0,
        };
      }
      return combatState;
    }

    // 更新格挡状态
    return {
      ...combatState,
      isBlocking: input.block,
      isAttacking: false, // 攻击状态在每个帧重置
    };
  }

  /**
   * 检查玩家是否死亡
   */
  static isDead(health: number): boolean {
    return health <= 0;
  }

  /**
   * 应用伤害
   */
  static applyDamage(
    currentHealth: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxHealth: number,
    damage: number,
  ): number {
    return Math.max(0, currentHealth - damage);
  }
}
