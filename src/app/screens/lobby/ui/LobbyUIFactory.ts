/**
 * 大厅 UI 工厂
 * 创建按钮、文本等 UI 元素
 */

import { Text, Graphics } from "pixi.js";
import { engine } from "../../../getEngine";

export interface Button {
  bg: Graphics;
  text: Text;
  onClick: () => void;
}

export class LobbyUIFactory {
  public static createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void,
  ): Button {
    const bg = new Graphics();
    bg.roundRect(x, y, width, height, 10)
      .fill({ color: 0x334455 })
      .stroke({ width: 2, color: 0x667788 });

    const textObj = new Text({
      text,
      style: { fontSize: 24, fill: 0xffffff, fontWeight: "bold" },
    });
    textObj.anchor.set(0.5);
    textObj.x = x + width / 2;
    textObj.y = y + height / 2;

    return { bg, text: textObj, onClick };
  }

  public static createRoomItem(
    roomName: string,
    playerCount: number,
    maxPlayers: number,
    hasPassword: boolean,
    y: number,
    onClick: () => void,
  ): Button {
    const bg = new Graphics();
    bg.roundRect(engine().screen.width / 2 - 300, y, 600, 80, 10)
      .fill({ color: 0x223344 })
      .stroke({ width: 2, color: 0x445566 });

    const nameText = new Text({
      text: roomName,
      style: { fontSize: 28, fill: 0xffffff, fontWeight: "bold" },
    });
    nameText.anchor.set(0, 0.5);
    nameText.x = engine().screen.width / 2 - 280;
    nameText.y = y + 25;

    const infoText = new Text({
      text: `${playerCount}/${maxPlayers} 玩家 ${hasPassword ? "🔒" : ""}`,
      style: { fontSize: 20, fill: 0x88aa88 },
    });
    infoText.anchor.set(0, 0.5);
    infoText.x = engine().screen.width / 2 - 280;
    infoText.y = y + 55;

    bg.addChild(nameText);
    bg.addChild(infoText);

    return { bg, text: nameText, onClick };
  }

  public static createPlayerListItem(
    playerName: string,
    isHost: boolean,
    index: number,
  ): { container: Graphics; name: Text; hostBadge: Text | null } {
    const container = new Graphics();

    const y = 150 + index * 60;
    container
      .roundRect(engine().screen.width / 2 - 250, y, 500, 50, 8)
      .fill({ color: 0x334455, alpha: 0.5 })
      .stroke({ width: 1, color: 0x556677 });

    const name = new Text({
      text: playerName,
      style: { fontSize: 24, fill: 0xffffff },
    });
    name.anchor.set(0, 0.5);
    name.x = engine().screen.width / 2 - 230;
    name.y = y + 25;

    container.addChild(name);

    let hostBadge: Text | null = null;
    if (isHost) {
      hostBadge = new Text({
        text: "👑 房主",
        style: { fontSize: 18, fill: 0xffaa00 },
      });
      hostBadge.anchor.set(1, 0.5);
      hostBadge.x = engine().screen.width / 2 + 230;
      hostBadge.y = y + 25;
      container.addChild(hostBadge);
    }

    return { container, name, hostBadge };
  }
}
