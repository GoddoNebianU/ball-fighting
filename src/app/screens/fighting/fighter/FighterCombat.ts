import { AttackType, ATTACK_CONFIG, AttackData } from "./FighterTypes";
import { FighterState } from "../types";
import { WeaponData } from "../weapons";

export class FighterCombat {
  state: FighterState = FighterState.IDLE;
  attackTimer = 0;
  cooldownTimer = 0;
  stunTimer = 0;
  currentAttack: AttackType | null = null;
  private currentAttackData: AttackData | null = null;
  hasHit = false;
  attackAngle = 0;

  startAttackFromWeapon(weaponData: WeaponData): boolean {
    this.attackTimer = weaponData.duration;
    this.hasHit = false;
    this.state = FighterState.ATTACK;
    this.currentAttackData = weaponData as AttackData;
    return true;
  }

  startAttack(type: AttackType): boolean {
    this.currentAttack = type;
    this.attackTimer = ATTACK_CONFIG[type].duration;
    this.hasHit = false;
    this.state = FighterState.ATTACK;
    return true;
  }

  updateAttack(deltaTime: number): void {
    if (this.state === FighterState.ATTACK) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        const cooldown =
          this.currentAttackData?.cooldown ||
          (this.currentAttack ? ATTACK_CONFIG[this.currentAttack].cooldown : 0);
        this.cooldownTimer = cooldown;
        this.currentAttack = null;
        this.currentAttackData = null;
        this.state = FighterState.IDLE;
      }
    }
    if (this.cooldownTimer > 0) this.cooldownTimer -= deltaTime;
  }

  takeHit(
    _damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    velocityX: number,
    velocityY: number,
  ): { vx: number; vy: number } {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const isBlocking = this.state === FighterState.BLOCK;
    const kb = knockback * (isBlocking ? 10.0 : 15.0);
    return {
      vx: velocityX + Math.cos(angle) * kb,
      vy: velocityY + Math.sin(angle) * kb,
    };
  }

  getCurrentAttack(): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    if (this.state !== FighterState.ATTACK)
      return { data: null, isActive: false, angle: 0, hasHit: false };
    const data =
      this.currentAttackData ||
      (this.currentAttack ? ATTACK_CONFIG[this.currentAttack] : null);
    if (!data) return { data: null, isActive: false, angle: 0, hasHit: false };
    const progress = 1 - this.attackTimer / data.duration;
    return {
      data,
      isActive: progress >= 0 && !this.hasHit,
      angle: this.attackAngle,
      hasHit: this.hasHit,
    };
  }

  markHit() {
    this.hasHit = true;
  }

  reset(initialX: number) {
    this.state = FighterState.IDLE;
    this.attackTimer = 0;
    this.cooldownTimer = 0;
    this.stunTimer = 0;
    this.currentAttack = null;
    this.currentAttackData = null;
    this.hasHit = false;
    this.attackAngle = initialX < 0 ? 0 : Math.PI;
  }

  get canAct() {
    return this.state !== FighterState.HIT;
  }
  get isBlocking() {
    return this.state === FighterState.BLOCK;
  }
  get isAttacking() {
    return this.state === FighterState.ATTACK;
  }

  setBlock(blocking: boolean) {
    if (blocking && this.state !== FighterState.WALK)
      this.state = FighterState.BLOCK;
    else if (!blocking && this.state === FighterState.BLOCK)
      this.state = FighterState.IDLE;
  }
}
