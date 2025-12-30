/**
 * 共享动画系统
 * 计算角色动画状态
 */

import { PLAYER_RENDERER_CONFIG } from "./PlayerRendererConfig";

export interface AnimationState {
  /** Y轴偏移（行走波动） */
  yOffset: number;
  /** 水平缩放（受击效果） */
  scaleX: number;
  /** 垂直缩放（受击效果） */
  scaleY: number;
  /** 旋转偏移（受击效果） */
  rotationOffset: number;
}

export class AnimationSystem {
  /**
   * 计算行走波动动画
   */
  static calculateWalkBob(time: number): number {
    const { walkBobSpeed, walkBobAmount } = PLAYER_RENDERER_CONFIG.animation;
    return Math.sin(time * walkBobSpeed) * walkBobAmount;
  }

  /**
   * 计算受击震动效果
   */
  static calculateHitShake(time: number, hitDuration: number): number {
    const { hitShakeAmount, hitShakeSpeed } = PLAYER_RENDERER_CONFIG.animation;
    const progress = time / hitDuration;
    const shakeIntensity = 1 - progress; // 随时间衰减

    return Math.sin(time * hitShakeSpeed) * hitShakeAmount * shakeIntensity;
  }

  /**
   * 计算受击缩放效果
   */
  static calculateHitScale(
    isHit: boolean,
    hitTime: number,
    hitDuration: number,
  ): { scaleX: number; scaleY: number } {
    if (!isHit) {
      return { scaleX: 1, scaleY: 1 };
    }

    const { hitScaleEffect } = PLAYER_RENDERER_CONFIG.animation;
    const progress = Math.min(1, (Date.now() - hitTime) / hitDuration);
    const scale = 1 - hitScaleEffect * (1 - progress);

    return { scaleX: scale, scaleY: scale };
  }

  /**
   * 计算受击旋转效果
   */
  static calculateHitRotation(
    isHit: boolean,
    hitTime: number,
    hitDuration: number,
  ): number {
    if (!isHit) {
      return 0;
    }

    const { hitRotationEffect } = PLAYER_RENDERER_CONFIG.animation;
    const progress = Math.min(1, (Date.now() - hitTime) / hitDuration);
    const rotationIntensity = 1 - progress;

    return (
      Math.sin((Date.now() - hitTime) * 0.05) *
      hitRotationEffect *
      rotationIntensity
    );
  }

  /**
   * 计算完整动画状态
   */
  static calculateAnimationState(
    isWalking: boolean,
    isHit: boolean,
    hitTime: number,
    hitDuration: number,
  ): AnimationState {
    const yOffset = isWalking ? this.calculateWalkBob(Date.now()) : 0;

    const { scaleX, scaleY } = this.calculateHitScale(
      isHit,
      hitTime,
      hitDuration,
    );

    const rotationOffset = this.calculateHitRotation(
      isHit,
      hitTime,
      hitDuration,
    );

    return {
      yOffset,
      scaleX,
      scaleY,
      rotationOffset,
    };
  }

  /**
   * 计算血条颜色
   */
  static calculateHealthBarColor(healthPercent: number): number {
    const {
      healthColorHigh,
      healthColorMedium,
      healthColorLow,
      healthThresholdHigh,
      healthThresholdLow,
    } = PLAYER_RENDERER_CONFIG.healthBar;

    if (healthPercent > healthThresholdHigh) {
      return healthColorHigh;
    } else if (healthPercent > healthThresholdLow) {
      return healthColorMedium;
    } else {
      return healthColorLow;
    }
  }
}
