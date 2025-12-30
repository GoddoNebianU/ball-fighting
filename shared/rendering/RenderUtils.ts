/**
 * 共享渲染工具类
 * 提供渲染计算辅助函数
 */

import { PLAYER_RENDERER_CONFIG } from "./PlayerRendererConfig";

export class RenderUtils {
  /**
   * 计算眼睛位置
   */
  static calculateEyePositions(rotation: number): {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
  } {
    const { eyeOffset, eyeDistance } = PLAYER_RENDERER_CONFIG.bodyParts;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // 计算眼睛基础位置（朝向）
    const baseX = eyeOffset.x * cos - eyeOffset.y * sin;
    const baseY = eyeOffset.x * sin + eyeOffset.y * cos;

    // 左眼
    const leftEye = {
      x: baseX - (eyeDistance / 2) * cos,
      y: baseY - (eyeDistance / 2) * sin,
    };

    // 右眼
    const rightEye = {
      x: baseX + (eyeDistance / 2) * cos,
      y: baseY + (eyeDistance / 2) * sin,
    };

    return { leftEye, rightEye };
  }

  /**
   * 计算手臂位置
   */
  static calculateArmPositions(
    rotation: number,
    isLeftArm: boolean,
  ): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } {
    const { armOffset, armLength } = PLAYER_RENDERER_CONFIG.bodyParts;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // 手臂在角色两侧
    const sideOffset = isLeftArm ? -1 : 1;
    const perpCos = -sin; // 垂直方向
    const perpSin = cos;

    const startX = armOffset.x * perpCos * sideOffset;
    const startY = armOffset.x * perpSin * sideOffset;

    const endX = startX + armLength * cos;
    const endY = startY + armLength * sin;

    return { startX, startY, endX, endY };
  }

  /**
   * 计算血条尺寸
   */
  static calculateHealthBarDimensions(healthPercent: number): {
    backgroundWidth: number;
    backgroundHeight: number;
    healthWidth: number;
    healthHeight: number;
    x: number;
    y: number;
  } {
    const { width, height, yOffset } = PLAYER_RENDERER_CONFIG.healthBar;

    return {
      backgroundWidth: width,
      backgroundHeight: height,
      healthWidth: width * Math.max(0, healthPercent),
      healthHeight: height,
      x: -width / 2,
      y: yOffset,
    };
  }

  /**
   * 计算阴影位置和尺寸
   */
  static calculateShadowPosition(): {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  } {
    const { yOffset, scale } = PLAYER_RENDERER_CONFIG.shadow;

    return {
      x: 0,
      y: yOffset,
      scaleX: scale,
      scaleY: scale * 0.5, // 压扁成椭圆
    };
  }

  /**
   * 计算方向指示器位置
   */
  static calculateDirectionIndicator(
    rotation: number,
    radius: number,
  ): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } {
    const indicatorLength = radius + 5;
    const endX = Math.cos(rotation) * indicatorLength;
    const endY = Math.sin(rotation) * indicatorLength;

    return {
      startX: 0,
      startY: 0,
      endX,
      endY,
    };
  }

  /**
   * 计算名字文本位置
   */
  static calculateNameTextPosition(): {
    x: number;
    y: number;
  } {
    const { radius } = PLAYER_RENDERER_CONFIG;
    return {
      x: 0,
      y: -radius - 15,
    };
  }

  /**
   * 标准化血量百分比
   */
  static normalizeHealthPercent(health: number, maxHealth: number): number {
    return Math.max(0, Math.min(1, health / maxHealth));
  }
}
