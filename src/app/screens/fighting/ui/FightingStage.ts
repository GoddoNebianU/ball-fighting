import { Container, Graphics } from "pixi.js";

import { FightingGame } from "../FightingGame";

/** 场景渲染 */
export class FightingStage {
  public readonly container: Container;
  private background: Graphics;
  private groundPattern: Graphics[] = [];

  constructor() {
    this.container = new Container();
    this.background = new Graphics();
    this.initStage();
  }

  private initStage(): void {
    // 背景渐变
    this.background
      .rect(
        -FightingGame.CONFIG.stageWidth / 2,
        -FightingGame.CONFIG.stageHeight / 2,
        FightingGame.CONFIG.stageWidth,
        FightingGame.CONFIG.stageHeight,
      )
      .fill({ color: 0x1a1a2e });

    this.container.addChild(this.background);

    // 地面网格图案
    const gridSize = 100;
    for (
      let x = -FightingGame.CONFIG.stageWidth / 2;
      x < FightingGame.CONFIG.stageWidth / 2;
      x += gridSize
    ) {
      const line = new Graphics();
      line
        .moveTo(x, -FightingGame.CONFIG.stageHeight / 2)
        .lineTo(x, FightingGame.CONFIG.stageHeight / 2)
        .stroke({
          width: 1,
          color: 0xffffff,
          alpha: 0.05,
        });
      this.groundPattern.push(line);
      this.container.addChild(line);
    }

    for (
      let y = -FightingGame.CONFIG.stageHeight / 2;
      y < FightingGame.CONFIG.stageHeight / 2;
      y += gridSize
    ) {
      const line = new Graphics();
      line
        .moveTo(-FightingGame.CONFIG.stageWidth / 2, y)
        .lineTo(FightingGame.CONFIG.stageWidth / 2, y)
        .stroke({
          width: 1,
          color: 0xffffff,
          alpha: 0.05,
        });
      this.groundPattern.push(line);
      this.container.addChild(line);
    }

    // 中心圆圈
    const centerCircle = new Graphics();
    centerCircle
      .circle(0, 0, 150)
      .stroke({ width: 3, color: 0xffffff, alpha: 0.1 });
    this.groundPattern.push(centerCircle);
    this.container.addChild(centerCircle);
  }
}
