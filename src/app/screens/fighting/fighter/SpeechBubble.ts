import { Container, Text, Graphics } from "pixi.js";

/** 对话气泡 - 显示AI说的话 */
export class SpeechBubble {
  private container: Container;
  private background: Graphics;
  private text: Text;
  private visible: boolean = false;
  private hideTimer: number = 0;
  private displayDuration: number = 2000; // 显示2秒

  constructor() {
    this.container = new Container();
    this.container.y = -50; // 在角色头顶显示

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
  }

  /** 更新（用于自动隐藏） */
  public update(deltaTime: number): void {
    if (!this.visible) return;

    this.hideTimer -= deltaTime;
    if (this.hideTimer <= 0) {
      this.hide();
    }
  }

  /** 隐藏对话 */
  public hide(): void {
    this.container.visible = false;
    this.visible = false;
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
