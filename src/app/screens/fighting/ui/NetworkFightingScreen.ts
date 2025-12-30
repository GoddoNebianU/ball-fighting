/**
 * 网络对战游戏屏幕
 * 包装 NetworkFightingGame 以符合 AppScreen 接口
 */

import { Container } from "pixi.js";
import { NetworkFightingGame } from "../network/NetworkFightingGame";

export class NetworkFightingScreen extends Container {
  public static assetBundles = ["main"];

  private game: NetworkFightingGame;

  constructor() {
    super();

    // 创建网络对战游戏（但不立即添加到场景）
    // 游戏会在收到 game:started 事件后初始化并自动添加到场景
    this.game = new NetworkFightingGame();

    console.log("[NetworkFightingScreen] 网络对战屏幕已创建");
  }

  /** 屏幕显示时调用 */
  async show(): Promise<void> {
    console.log("[NetworkFightingScreen] 屏幕已显示");

    // 将游戏容器添加到场景中
    if (!this.children.includes(this.game)) {
      this.addChild(this.game);
      console.log("[NetworkFightingScreen] 游戏已添加到场景");
    }
  }

  /** 屏幕隐藏时调用 */
  async hide(): Promise<void> {
    console.log("[NetworkFightingScreen] 屏幕已隐藏");
  }

  /** 屏幕准备 */
  public prepare() {}

  /** 屏幕暂停 */
  public async pause() {}

  /** 屏幕恢复 */
  public async resume() {}

  /** 屏幕失焦 */
  public blur() {}

  /** 屏幕重置 */
  reset(): void {
    this.game.destroy();
    this.removeChildren();
    console.log("[NetworkFightingScreen] 屏幕已重置");
  }

  /** 更新游戏 */
  update(): void {
    this.game.update(performance.now());
  }

  /** 屏幕大小调整 */
  resize(width: number, height: number): void {
    // 将游戏居中显示
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    this.game.x = centerX;
    this.game.y = centerY;
  }
}
