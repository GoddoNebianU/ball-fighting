import { Fighter } from "../fighter/Fighter";
import { Bullet } from "../combat/Bullet";
import { BulletManager } from "../combat/BulletManager";
import { AIDodgeCalculator } from "./AIDodgeCalculator";

/** AI子弹躲避系统 */
export class AIBulletDodge {
  private currentDodgeTimer: number = 0; // 当前躲避持续时间
  private readonly DODGE_DURATION = 500; // 每次躲避持续500ms
  private readonly DANGER_ZONE = 400; // 死区:只有子弹距离小于400px才躲避
  private savedDodgeInputs = {
    left: false,
    right: false,
    up: false,
    down: false,
    block: false,
  }; // 保存躲避输入,避免每帧重置
  private isDodgeDirectionLocked = false; // 锁定躲避方向,避免左右摇摆
  private smoothedDodgeX = 0; // 平滑后的X方向躲避值
  private smoothedDodgeY = 0; // 平滑后的Y方向躲避值
  private readonly SMOOTHING_FACTOR = 0.3; // 平滑系数 (0-1,越大越平滑) - 降低到0.3让躲避更快生效

  /** 检查并躲避子弹 */
  public checkAndDodgeBullets(
    ai: Fighter,
    bulletManager: BulletManager,
  ): boolean {
    const bullets = bulletManager["bullets"] as Bullet[];

    if (bullets.length === 0) {
      this.currentDodgeTimer = 0;
      this.clearDodgeInputs(ai);
      this.resetSmoothing();
      return false;
    }

    let mostDangerousBullet: Bullet | null = null;
    let minTimeToImpact = Infinity;

    // 找到最危险的子弹(即将击中AI的子弹)
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      if (bullet.owner === ai) continue;

      // 计算子弹到AI的距离
      const dx = ai.x - bullet.x;
      const dy = ai.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 死区检查:子弹太远就不躲避
      if (dist > this.DANGER_ZONE) continue;

      const timeToImpact = AIDodgeCalculator.calculateTimeToImpact(ai, bullet);

      if (timeToImpact > 0 && timeToImpact < minTimeToImpact) {
        minTimeToImpact = timeToImpact;
        mostDangerousBullet = bullet;
      }
    }

    // 如果有危险子弹,执行躲避
    // 检测范围: 800ms内会击中的子弹 (缩小检测窗口,只在真正危险时躲避)
    if (mostDangerousBullet && minTimeToImpact < 800) {
      // 如果方向没有锁定,计算并锁定新方向
      if (!this.isDodgeDirectionLocked) {
        this.dodgeBullet(ai, mostDangerousBullet);
        this.isDodgeDirectionLocked = true;
        this.currentDodgeTimer = this.DODGE_DURATION; // 只在计算新方向时重置timer
      } else {
        // 方向已锁定,继续应用平滑后的躲避方向
        this.applySmoothedDodge(ai);
      }
      return true;
    }

    // 如果正在躲避中,继续保持躲避方向
    if (this.currentDodgeTimer > 0) {
      this.currentDodgeTimer -= 16; // 假设60fps,每帧约16ms
      // 应用平滑后的躲避输入
      this.applySmoothedDodge(ai);
      return true;
    }

    // 没有危险子弹,解锁方向并重置平滑
    if (this.isDodgeDirectionLocked) {
      this.isDodgeDirectionLocked = false;
      this.resetSmoothing();
    }

    return false;
  }

  /** 应用平滑后的躲避输入 */
  private applySmoothedDodge(ai: Fighter): void {
    // 根据平滑值设置输入(添加死区避免抖动)
    const DEADZONE = 0.15; // 死区阈值 - 降低到0.15让躲避更灵敏

    ai.input.left = this.smoothedDodgeX < -DEADZONE;
    ai.input.right = this.smoothedDodgeX > DEADZONE;
    ai.input.up = this.smoothedDodgeY < -DEADZONE;
    ai.input.down = this.smoothedDodgeY > DEADZONE;
    ai.input.block = this.savedDodgeInputs.block;
  }

  /** 重置平滑值 */
  private resetSmoothing(): void {
    this.smoothedDodgeX = 0;
    this.smoothedDodgeY = 0;
  }

  /** 清空躲避输入 */
  private clearDodgeInputs(ai: Fighter): void {
    ai.input.left = false;
    ai.input.right = false;
    ai.input.up = false;
    ai.input.down = false;
    ai.input.block = false;
    this.savedDodgeInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
    };
  }

  /** 躲避子弹 */
  private dodgeBullet(ai: Fighter, bullet: Bullet): void {
    const { dodgeX, dodgeY, block } = AIDodgeCalculator.calculateDodgeDirection(
      ai,
      bullet,
    );

    // 保存格挡状态
    this.savedDodgeInputs.block = block;

    // 应用平滑滤波
    this.smoothedDodgeX =
      this.smoothedDodgeX * this.SMOOTHING_FACTOR +
      dodgeX * (1 - this.SMOOTHING_FACTOR);
    this.smoothedDodgeY =
      this.smoothedDodgeY * this.SMOOTHING_FACTOR +
      dodgeY * (1 - this.SMOOTHING_FACTOR);

    // 立即应用平滑后的输入
    this.applySmoothedDodge(ai);
  }

  public reset(): void {
    this.currentDodgeTimer = 0;
    this.isDodgeDirectionLocked = false;
    this.resetSmoothing();
    this.savedDodgeInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
    };
  }
}
