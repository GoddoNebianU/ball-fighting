import { Graphics, Text } from "pixi.js";
import {
  PLAYER_RENDERER_CONFIG,
  type HealthBarConfig,
} from "@shared/rendering/PlayerRendererConfig";
import { RenderUtils, AnimationSystem } from "@shared/rendering/index";

/** RemoteFighter 渲染组件 */
export class RemoteFighterRenderer {
  private readonly RADIUS = PLAYER_RENDERER_CONFIG.radius;
  private readonly healthBarConfig: HealthBarConfig =
    PLAYER_RENDERER_CONFIG.healthBar;

  public createBody(color: number): Graphics {
    const body = new Graphics();
    body.circle(0, 0, this.RADIUS).fill({ color });
    body.circle(0, 0, this.RADIUS).stroke({ width: 2, color: 0x000000 });
    return body;
  }

  public createNameText(name: string): Text {
    const nameText = new Text({
      text: name,
      style: {
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    nameText.anchor.set(0.5);

    const position = RenderUtils.calculateNameTextPosition();
    nameText.y = position.y;

    return nameText;
  }

  public createHealthBar(): Graphics {
    const healthBar = new Graphics();
    healthBar.y = this.healthBarConfig.yOffset;
    return healthBar;
  }

  public updateBody(
    body: Graphics,
    color: number,
    radius: number,
    rotation: number,
  ): void {
    body.clear();
    body.circle(0, 0, radius).fill({ color });
    body.circle(0, 0, radius).stroke({ width: 2, color: 0x000000 });

    const indicatorLength = radius + 5;
    const endX = Math.cos(rotation) * indicatorLength;
    const endY = Math.sin(rotation) * indicatorLength;

    body.moveTo(0, 0);
    body.lineTo(endX, endY);
    body.stroke({ width: 3, color: 0x000000 });
  }

  public updateHealthBar(
    healthBar: Graphics,
    health: number,
    maxHealth: number,
  ): void {
    healthBar.clear();

    const healthPercent = RenderUtils.normalizeHealthPercent(health, maxHealth);
    const dims = RenderUtils.calculateHealthBarDimensions(healthPercent);

    // 绘制背景
    healthBar
      .roundRect(
        dims.x,
        dims.y,
        dims.backgroundWidth,
        dims.backgroundHeight,
        this.healthBarConfig.borderRadius,
      )
      .fill({ color: this.healthBarConfig.backgroundColor });

    // 绘制血量
    if (healthPercent > 0) {
      const healthColor =
        AnimationSystem.calculateHealthBarColor(healthPercent);

      healthBar
        .roundRect(
          dims.x,
          dims.y,
          dims.healthWidth,
          dims.healthHeight,
          this.healthBarConfig.borderRadius,
        )
        .fill({ color: healthColor });
    }
  }
}
