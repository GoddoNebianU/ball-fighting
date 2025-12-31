import { Fighter } from "../fighter/Fighter";

/** PID瞄准控制器状态 */
interface PIDAimState {
  integralX: number; // X方向积分累积
  integralY: number; // Y方向积分累积
  lastErrorX: number; // 上次X方向误差(用于微分)
  lastErrorY: number; // 上次Y方向误差(用于微分)
}

/** AI PID预判瞄准系统 */
export class AIAimController {
  private state: Map<Fighter, PIDAimState> = new Map();

  /** 获取或创建PID状态 */
  private getState(ai: Fighter): PIDAimState {
    if (!this.state.has(ai)) {
      this.state.set(ai, {
        integralX: 0,
        integralY: 0,
        lastErrorX: 0,
        lastErrorY: 0,
      });
    }
    return this.state.get(ai)!;
  }

  /** PID预判瞄准 - 使用PID控制器智能追踪目标 */
  public aimAtTargetWithPrediction(
    ai: Fighter,
    target: Fighter,
    currentDistance: number,
  ): void {
    const pidState = this.getState(ai);

    // 获取当前武器数据
    const weaponData = ai.currentWeapon.getData();

    // 只有投射物武器才需要预判
    if (!weaponData.projectile) {
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    // 获取子弹速度
    const bulletSpeed = weaponData.projectileSpeed || 800;
    const timeToImpact = currentDistance / bulletSpeed;

    // 计算目标速度
    const targetSpeed = Math.sqrt(
      target.velocityX * target.velocityX + target.velocityY * target.velocityY,
    );

    // 如果目标几乎静止,直接瞄准目标位置,不使用PID
    if (targetSpeed < 10) {
      // 目标静止,清零PID累积误差
      pidState.integralX = 0;
      pidState.integralY = 0;
      pidState.lastErrorX = 0;
      pidState.lastErrorY = 0;

      // 直接瞄准目标当前位置
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    // PID参数 - 只在目标移动时使用
    const kp = 1.0; // 比例系数: 当前误差权重
    const ki = 0.03; // 积分系数: 历史累积误差权重(用于追踪持续移动目标)
    const kd = 0.1; // 微分系数: 误差变化率权重(用于预测移动趋势)

    // 计算目标预测位置(基础预测)
    const predictedX = target.x + target.velocityX * timeToImpact;
    const predictedY = target.y + target.velocityY * timeToImpact;

    // 计算当前误差(目标位置 - AI当前位置)
    const errorX = predictedX - ai.x;
    const errorY = predictedY - ai.y;

    // P项: 比例控制 - 当前误差
    const pX = errorX * kp;
    const pY = errorY * kp;

    // I项: 积分控制 - 累积误差
    // 限制积分项范围,防止积分饱和
    const integralLimit = 50;
    pidState.integralX += errorX * ki;
    pidState.integralY += errorY * ki;
    pidState.integralX = Math.max(
      -integralLimit,
      Math.min(integralLimit, pidState.integralX),
    );
    pidState.integralY = Math.max(
      -integralLimit,
      Math.min(integralLimit, pidState.integralY),
    );

    // D项: 微分控制 - 误差变化率
    const dX = (errorX - pidState.lastErrorX) * kd;
    const dY = (errorY - pidState.lastErrorY) * kd;

    // 保存当前误差供下次使用
    pidState.lastErrorX = errorX;
    pidState.lastErrorY = errorY;

    // PID输出: 目标偏移量
    const aimOffsetX = pX + pidState.integralX + dX;
    const aimOffsetY = pY + pidState.integralY + dY;

    // 计算最终瞄准位置
    const finalAimX = ai.x + aimOffsetX;
    const finalAimY = ai.y + aimOffsetY;

    // 向最终瞄准位置瞄准
    ai.setFacingDirection(finalAimX, finalAimY);
  }

  /** 重置所有PID状态 */
  public reset(): void {
    this.state.forEach((pidState) => {
      pidState.integralX = 0;
      pidState.integralY = 0;
      pidState.lastErrorX = 0;
      pidState.lastErrorY = 0;
    });
    this.state.clear();
  }
}
