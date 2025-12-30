/**
 * 远程子弹类
 * 渲染来自服务器的子弹
 */

import { Container, Graphics } from "pixi.js";
import type { BulletState } from "./types";

export class RemoteBullet extends Container {
  public id: string;
  public ownerId: string;
  public damage: number;
  public active: boolean;

  private graphics: Graphics;
  private targetPosition: { x: number; y: number };
  private readonly BULLET_RADIUS = 5;

  constructor(state: BulletState) {
    super();

    this.id = state.id;
    this.ownerId = state.ownerId;
    this.damage = state.damage;
    this.active = state.active;

    // 初始化位置
    this.x = state.position.x;
    this.y = state.position.y;
    this.targetPosition = { ...state.position };

    // 创建图形
    this.graphics = new Graphics();
    this.createBulletGraphics();
    this.addChild(this.graphics);
  }

  /**
   * 同步状态
   */
  syncState(state: BulletState): void {
    this.targetPosition = { ...state.position };
    this.active = state.active;

    if (!this.active) {
      this.visible = false;
    }
  }

  /**
   * 更新插值
   */
  updateInterpolation(): void {
    if (!this.active) {
      this.visible = false;
      return;
    }

    // 位置插值（Lerp）
    const LERP_FACTOR = 0.3;
    this.x += (this.targetPosition.x - this.x) * LERP_FACTOR;
    this.y += (this.targetPosition.y - this.y) * LERP_FACTOR;
  }

  /**
   * 创建子弹图形
   */
  private createBulletGraphics(): void {
    this.graphics.clear();

    // 子弹主体
    this.graphics.circle(0, 0, this.BULLET_RADIUS).fill({ color: 0xffff00 });

    // 发光效果
    this.graphics
      .circle(0, 0, this.BULLET_RADIUS + 2)
      .stroke({ width: 2, color: 0xffaa00, alpha: 0.5 });
  }

  /**
   * 销毁子弹
   */
  destroy(): void {
    this.graphics.clear();
    this.removeChildren();
  }
}
