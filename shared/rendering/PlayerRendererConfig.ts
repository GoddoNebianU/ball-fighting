/**
 * 共享玩家渲染配置
 * 前后端通用的渲染参数
 */

import { GAME_CONFIG } from "../types";

export interface BodyPartsConfig {
  /** 眼睛位置偏移 */
  eyeOffset: { x: number; y: number };
  /** 眼睛大小 */
  eyeRadius: number;
  /** 眼睛间距 */
  eyeDistance: number;
  /** 手臂长度 */
  armLength: number;
  /** 手臂宽度 */
  armWidth: number;
  /** 手臂位置偏移 */
  armOffset: { x: number; y: number };
}

export interface ShadowConfig {
  /** 阴影透明度 */
  alpha: number;
  /** 阴影Y偏移 */
  yOffset: number;
  /** 阴影缩放 */
  scale: number;
}

export interface HealthBarConfig {
  /** 血条宽度 */
  width: number;
  /** 血条高度 */
  height: number;
  /** 血条Y偏移（相对于角色中心） */
  yOffset: number;
  /** 血条圆角半径 */
  borderRadius: number;
  /** 血条背景颜色 */
  backgroundColor: number;
  /** 血条颜色（高血量） */
  healthColorHigh: number;
  /** 血条颜色（中血量） */
  healthColorMedium: number;
  /** 血条颜色（低血量） */
  healthColorLow: number;
  /** 血量阈值（高/中） */
  healthThresholdHigh: number;
  /** 血量阈值（中/低） */
  healthThresholdLow: number;
}

export interface AnimationConfig {
  /** 行走波动速度 */
  walkBobSpeed: number;
  /** 行走波动幅度 */
  walkBobAmount: number;
  /** 受击震动幅度 */
  hitShakeAmount: number;
  /** 受击震动速度 */
  hitShakeSpeed: number;
  /** 受击缩放效果 */
  hitScaleEffect: number;
  /** 受击旋转效果 */
  hitRotationEffect: number;
}

export interface PlayerRendererConfig {
  /** 角色半径 */
  radius: number;
  /** 身体部位配置 */
  bodyParts: BodyPartsConfig;
  /** 阴影配置 */
  shadow: ShadowConfig;
  /** 血条配置 */
  healthBar: HealthBarConfig;
  /** 动画配置 */
  animation: AnimationConfig;
}

export const PLAYER_RENDERER_CONFIG: PlayerRendererConfig = {
  radius: GAME_CONFIG.PLAYER_RADIUS,

  bodyParts: {
    eyeOffset: { x: 0, y: -5 },
    eyeRadius: 3,
    eyeDistance: 8,
    armLength: 20,
    armWidth: 6,
    armOffset: { x: 15, y: 0 },
  },

  shadow: {
    alpha: 0.2,
    yOffset: 5,
    scale: 1,
  },

  healthBar: {
    width: 50,
    height: 6,
    yOffset: -33,
    borderRadius: 3,
    backgroundColor: 0x333333,
    healthColorHigh: 0x44ff44,
    healthColorMedium: 0xffaa00,
    healthColorLow: 0xff4444,
    healthThresholdHigh: 0.5,
    healthThresholdLow: 0.25,
  },

  animation: {
    walkBobSpeed: 0.15,
    walkBobAmount: 3,
    hitShakeAmount: 1,
    hitShakeSpeed: 0.5,
    hitScaleEffect: 0.9,
    hitRotationEffect: 0.1,
  },
};
