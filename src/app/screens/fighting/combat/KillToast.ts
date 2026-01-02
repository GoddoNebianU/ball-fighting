import { Container, Text, Graphics } from "pixi.js";

/** 击杀Toast - 显示击杀通知 */
export class KillToast {
  private container: Container;
  private background: Graphics;
  private killerText: Text;
  private victimText: Text;
  private visible: boolean = false;
  private displayTimer: number = 0;
  private displayDuration: number = 3000; // 显示3秒

  // 动画相关
  private targetAlpha: number = 1;
  private currentAlpha: number = 0;
  private animationSpeed: number = 0.05;

  constructor() {
    this.container = new Container();

    this.background = new Graphics();
    this.killerText = new Text({
      text: "",
      style: {
        fontSize: 20,
        fontWeight: "bold",
        fill: 0xff0000,
      },
    });
    this.victimText = new Text({
      text: "",
      style: {
        fontSize: 20,
        fontWeight: "bold",
        fill: 0x888888,
      },
    });

    this.killerText.anchor.set(1, 0.5); // 右对齐
    this.victimText.anchor.set(0, 0.5); // 左对齐

    this.container.addChild(this.background, this.killerText, this.victimText);
    this.container.visible = false;
    this.container.alpha = 0;
  }

  /** 显示击杀信息 */
  public show(
    killerName: string,
    victimName: string,
    killerColor: number = 0xff0000,
    victimColor: number = 0x888888,
  ): void {
    this.killerText.text = `${killerName} 击杀了`;
    this.victimText.text = victimName;

    // 更新颜色为玩家实际颜色
    this.killerText.style = {
      fontSize: 20,
      fontWeight: "bold",
      fill: killerColor,
    };
    this.victimText.style = {
      fontSize: 20,
      fontWeight: "bold",
      fill: victimColor,
    };

    // 计算位置
    const padding = 10;
    const totalWidth =
      this.killerText.width + 20 + this.victimText.width + padding * 2;
    const height =
      Math.max(this.killerText.height, this.victimText.height) + padding * 2;

    // 绘制背景
    this.background.clear();
    this.background
      .roundRect(-totalWidth / 2, -height / 2, totalWidth, height, 4)
      .fill({ color: 0x000000, alpha: 0.7 })
      .stroke({ width: 2, color: 0xff0000, alpha: 0.8 });

    // 设置文字位置
    this.killerText.x = -10;
    this.victimText.x = 10;

    this.container.visible = true;
    this.visible = true;
    this.displayTimer = this.displayDuration;

    // 重置动画
    this.currentAlpha = 0;
    this.targetAlpha = 1;
  }

  /** 更新动画 */
  public update(deltaTime: number): void {
    if (!this.visible) return;

    // 淡入淡出动画
    const dAlpha = this.targetAlpha - this.currentAlpha;
    this.currentAlpha += dAlpha * this.animationSpeed;
    this.container.alpha = this.currentAlpha;

    this.displayTimer -= deltaTime;
    if (this.displayTimer <= 0) {
      this.targetAlpha = 0;

      if (this.currentAlpha < 0.01) {
        this.hide();
      }
    }
  }

  /** 隐藏 */
  private hide(): void {
    this.container.visible = false;
    this.visible = false;
    this.container.alpha = 0;
    this.currentAlpha = 0;
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
