import { Graphics, Text } from "pixi.js";

/** RemoteFighter 渲染组件 */
export class RemoteFighterRenderer {
  private readonly RADIUS = 25;

  public createBody(color: number): Graphics {
    const body = new Graphics();
    body.circle(0, 0, this.RADIUS).fill({ color });
    body.circle(0, 0, this.RADIUS).stroke({ width: 2, color: 0x000000 });
    return body;
  }

  public createNameText(name: string, radius: number): Text {
    const nameText = new Text({
      text: name,
      style: {
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    nameText.anchor.set(0.5);
    nameText.y = -radius - 15;
    return nameText;
  }

  public createHealthBar(radius: number): Graphics {
    const healthBar = new Graphics();
    healthBar.y = -radius - 8;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _radius: number,
  ): void {
    healthBar.clear();

    const barWidth = 50;
    const barHeight = 6;
    const healthPercent = Math.max(0, health / 200);

    healthBar
      .roundRect(-barWidth / 2, 0, barWidth, barHeight, 3)
      .fill({ color: 0x333333 });

    if (healthPercent > 0) {
      const healthWidth = barWidth * healthPercent;
      const healthColor =
        healthPercent > 0.5
          ? 0x44ff44
          : healthPercent > 0.25
            ? 0xffaa00
            : 0xff4444;

      healthBar
        .roundRect(-barWidth / 2, 0, healthWidth, barHeight, 3)
        .fill({ color: healthColor });
    }
  }
}
