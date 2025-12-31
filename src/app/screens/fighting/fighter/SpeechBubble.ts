import { Container, Text, Graphics } from "pixi.js";

/** 对话气泡 - 显示AI说的话 */
export class SpeechBubble {
  private container: Container;
  private background: Graphics;
  private text: Text;
  private visible: boolean = false;
  private hideTimer: number = 0;
  private displayDuration: number = 2000; // 显示2秒

  // 平滑动画相关
  private targetY: number = -50;
  private currentY: number = 0;
  private targetAlpha: number = 1;
  private currentAlpha: number = 0;
  private animationSpeed: number = 0.1; // 缓动系数，越小越平滑

  // 追踪的目标 Fighter（用于获取世界坐标）
  private targetFighter: { x: number; y: number } | null = null;

  constructor() {
    this.container = new Container();
    this.container.y = 0; // 初始位置，会通过动画移动到 -50

    this.background = new Graphics();
    this.text = new Text({
      text: "",
      style: {
        fontSize: 16,
        fontWeight: "bold",
        fill: 0xffffff,
        align: "center",
      },
    });
    this.text.anchor.set(0.5, 0.5);

    this.container.addChild(this.background, this.text);
    this.container.visible = false;
    this.container.alpha = 0;
  }

  /** 设置追踪的目标 */
  public setTarget(target: { x: number; y: number }): void {
    this.targetFighter = target;
  }

  /** 显示对话 */
  public show(message: string): void {
    this.text.text = message;

    // 计算背景大小
    const padding = 10;
    const width = this.text.width + padding * 2;
    const height = this.text.height + padding * 2;

    // 绘制气泡背景
    this.background.clear();
    this.background
      .roundRect(-width / 2, -height / 2, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.8 })
      .stroke({ width: 2, color: 0xffffff });

    this.container.visible = true;
    this.visible = true;
    this.hideTimer = this.displayDuration;

    // 重置动画状态
    this.currentY = 0;
    this.currentAlpha = 0;
    this.targetY = -50;
    this.targetAlpha = 1;
  }

  /** 更新（用于自动隐藏和平滑动画） */
  public update(deltaTime: number): void {
    if (!this.visible) return;

    // 更新气泡位置，追踪 Fighter 的世界坐标
    if (this.targetFighter) {
      this.container.x = this.targetFighter.x;
      this.container.y = this.targetFighter.y + this.currentY;
    } else {
      this.container.y = this.currentY;
    }

    // 平滑移动位置（线性插值）
    const dy = this.targetY - this.currentY;
    this.currentY += dy * this.animationSpeed;

    // 平滑淡入淡出
    const dAlpha = this.targetAlpha - this.currentAlpha;
    this.currentAlpha += dAlpha * this.animationSpeed;
    this.container.alpha = this.currentAlpha;

    this.hideTimer -= deltaTime;
    if (this.hideTimer <= 0) {
      // 开始淡出动画
      this.targetAlpha = 0;
      this.targetY = -70; // 稍微向上移动一点

      // 如果已经完全透明，则隐藏
      if (this.currentAlpha < 0.01) {
        this.hide();
      }
    }
  }

  /** 隐藏对话 */
  public hide(): void {
    this.container.visible = false;
    this.visible = false;
    this.container.alpha = 0;
    this.currentY = 0;
  }

  /** 获取容器 */
  public getContainer(): Container {
    return this.container;
  }

  /** 是否正在显示 */
  public isVisible(): boolean {
    return this.visible;
  }
}
