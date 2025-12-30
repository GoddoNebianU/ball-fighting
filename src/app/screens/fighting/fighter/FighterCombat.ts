import { AttackType, ATTACK_CONFIG, AttackData } from "./FighterTypes";
import { FighterState } from "../types";
import { WeaponData } from "../weapons";

/** 角色战斗系统 */
export class FighterCombat {
  public state: FighterState = FighterState.IDLE;

  public attackTimer: number = 0;
  public cooldownTimer: number = 0;
  public stunTimer: number = 0;
  public currentAttack: AttackType | null = null;
  private currentAttackData: AttackData | null = null;
  public hasHit: boolean = false;

  // 攻击方向角度（弧度）
  public attackAngle: number = 0;

  constructor() {}

  /** 从武器数据开始攻击 */
  public startAttackFromWeapon(weaponData: WeaponData): boolean {
    this.attackTimer = weaponData.duration;
    this.hasHit = false;
    this.state = FighterState.ATTACK;

    // 保存攻击数据以便后续使用
    this.currentAttackData = weaponData as AttackData;

    return true;
  }

  /** 旧的攻击方法(保留兼容性) */
  public startAttack(type: AttackType): boolean {
    this.currentAttack = type;
    this.attackTimer = ATTACK_CONFIG[type].duration;
    this.hasHit = false;
    this.state = FighterState.ATTACK;
    return true;
  }

  public updateAttack(deltaTime: number): void {
    // 处理攻击状态
    if (this.state === FighterState.ATTACK) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        // 使用当前攻击数据或旧的ATTACK_CONFIG
        const cooldown =
          this.currentAttackData?.cooldown ||
          (this.currentAttack ? ATTACK_CONFIG[this.currentAttack].cooldown : 0);

        this.cooldownTimer = cooldown;
        this.currentAttack = null;
        this.currentAttackData = null;
        this.state = FighterState.IDLE;
      }
    }

    // 更新冷却
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaTime;
    }

    // 移除硬直系统,只保留击退效果
  }

  public takeHit(
    _damage: number,
    knockback: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    velocityX: number,
    velocityY: number,
  ): { vx: number; vy: number } {
    // 计算从攻击者到被击中者的方向向量
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    if (this.state === FighterState.BLOCK) {
      // 格挡时击退减半
      const blockKnockback = knockback * 10.0;
      return {
        vx: velocityX + Math.cos(angle) * blockKnockback,
        vy: velocityY + Math.sin(angle) * blockKnockback,
      };
    } else {
      // 击退效果
      const enhancedKnockback = knockback * 15.0;
      return {
        vx: velocityX + Math.cos(angle) * enhancedKnockback,
        vy: velocityY + Math.sin(angle) * enhancedKnockback,
      };
    }
  }

  public getCurrentAttack(): {
    data: AttackData | null;
    isActive: boolean;
    angle: number;
    hasHit: boolean;
  } {
    if (this.state !== FighterState.ATTACK) {
      return { data: null, isActive: false, angle: 0, hasHit: false };
    }

    // 使用当前攻击数据
    const data =
      this.currentAttackData ||
      (this.currentAttack ? ATTACK_CONFIG[this.currentAttack] : null);

    if (!data) {
      return { data: null, isActive: false, angle: 0, hasHit: false };
    }

    const progress = 1 - this.attackTimer / data.duration;
    // 扩大激活窗口期,确保投射物能正确生成
    const isActive = progress >= 0 && !this.hasHit;
    const angle = this.attackAngle;

    return {
      data,
      isActive,
      angle,
      hasHit: this.hasHit,
    };
  }

  public markHit(): void {
    this.hasHit = true;
  }

  public reset(initialX: number): void {
    this.state = FighterState.IDLE;
    this.attackTimer = 0;
    this.cooldownTimer = 0;
    this.stunTimer = 0;
    this.currentAttack = null;
    this.currentAttackData = null;
    this.hasHit = false;
    if (initialX < 0) {
      this.attackAngle = 0;
    } else {
      this.attackAngle = Math.PI;
    }
  }

  public get canAct(): boolean {
    return this.state !== FighterState.HIT;
  }

  public get isBlocking(): boolean {
    return this.state === FighterState.BLOCK;
  }

  public get isAttacking(): boolean {
    return this.state === FighterState.ATTACK;
  }

  public setBlock(blocking: boolean): void {
    if (blocking && this.state !== FighterState.WALK) {
      this.state = FighterState.BLOCK;
    } else if (!blocking && this.state === FighterState.BLOCK) {
      this.state = FighterState.IDLE;
    }
  }
}
