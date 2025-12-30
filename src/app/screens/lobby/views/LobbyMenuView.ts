/**
 * 大厅主菜单视图
 */

import { Container, Text } from "pixi.js";
import { engine } from "../../../getEngine";
import { LobbyUIFactory, Button } from "../ui/LobbyUIFactory";

export class LobbyMenuView extends Container {
  public showMenu(onBackToMenu?: () => void): void {
    this.removeChildren();

    // 标题
    const title = new Text({
      text: "多人对战",
      style: { fontSize: 72, fill: 0xffaa00, fontWeight: "bold" },
    });
    title.anchor.set(0.5);
    title.x = engine().screen.width / 2;
    title.y = 150;
    this.addChild(title);

    const createBtn = LobbyUIFactory.createButton(
      "创建房间",
      engine().screen.width / 2 - 200,
      300,
      400,
      60,
      () => {
        this.emit("showCreateRoom");
      },
    );
    this.addButton(createBtn);

    const joinBtn = LobbyUIFactory.createButton(
      "加入房间",
      engine().screen.width / 2 - 200,
      400,
      400,
      60,
      () => {
        this.emit("showRoomList");
      },
    );
    this.addButton(joinBtn);

    const backBtn = LobbyUIFactory.createButton(
      "返回主菜单",
      engine().screen.width / 2 - 200,
      700,
      400,
      60,
      () => {
        if (onBackToMenu) {
          onBackToMenu();
        }
      },
    );
    this.addButton(backBtn);
  }

  private addButton(btn: Button): void {
    this.addChild(btn.bg);
    this.addChild(btn.text);

    btn.bg.eventMode = "static";
    btn.bg.cursor = "pointer";
    btn.bg.on("pointerdown", btn.onClick);
  }
}
