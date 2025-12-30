import { Fighter } from "../fighter/Fighter";
import type { AIController } from "./AIController";

/** PID 预判瞄准系统 */
export class AIAiming {
  /** 使用 PID 控制器智能追踪目标 */
  public static aimAtTargetWithPrediction(
    ai: Fighter,
    target: Fighter,
    currentDistance: number,
    controller: AIController,
  ): void {
    const weaponData = ai.currentWeapon.getData();

    // 只有投射物武器才需要预判
    if (!weaponData.projectile) {
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    const bulletSpeed = weaponData.projectileSpeed || 800;
    const timeToImpact = currentDistance / bulletSpeed;

    // 计算目标速度
    const targetSpeed = Math.sqrt(
      target.velocityX * target.velocityX + target.velocityY * target.velocityY,
    );

    // 如果目标几乎静止，直接瞄准目标位置，不使用 PID
    if (targetSpeed < 10) {
      this.resetPID(controller);
      ai.setFacingDirection(target.x, target.y);
      return;
    }

    // PID 参数
    const kp = 1.0; // 比例系数
    const ki = 0.03; // 积分系数
    const kd = 0.1; // 微分系数

    // 计算目标预测位置
    const predictedX = target.x + target.velocityX * timeToImpact;
    const predictedY = target.y + target.velocityY * timeToImpact;

    // 计算当前误差
    const errorX = predictedX - ai.x;
    const errorY = predictedY - ai.y;

    // P 项：比例控制
    const pX = errorX * kp;
    const pY = errorY * kp;

    // I 项：积分控制
    const integralLimit = 50;
    controller.pidAim.integralX += errorX * ki;
    controller.pidAim.integralY += errorY * ki;
    controller.pidAim.integralX = Math.max(
      -integralLimit,
      Math.min(integralLimit, controller.pidAim.integralX),
    );
    controller.pidAim.integralY = Math.max(
      -integralLimit,
      Math.min(integralLimit, controller.pidAim.integralY),
    );

    // D 项：微分控制
    const dX = (errorX - controller.pidAim.lastErrorX) * kd;
    const dY = (errorY - controller.pidAim.lastErrorY) * kd;

    // 保存当前误差
    controller.pidAim.lastErrorX = errorX;
    controller.pidAim.lastErrorY = errorY;

    // PID 输出
    const aimOffsetX = pX + controller.pidAim.integralX + dX;
    const aimOffsetY = pY + controller.pidAim.integralY + dY;

    // 计算最终瞄准位置
    const finalAimX = ai.x + aimOffsetX;
    const finalAimY = ai.y + aimOffsetY;

    ai.setFacingDirection(finalAimX, finalAimY);
  }

  private static resetPID(controller: AIController): void {
    controller.pidAim.integralX = 0;
    controller.pidAim.integralY = 0;
    controller.pidAim.lastErrorX = 0;
    controller.pidAim.lastErrorY = 0;
  }
}
