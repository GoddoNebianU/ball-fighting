/**
 * 大厅房间列表视图
 */

import { Container, Text } from "pixi.js";
import { engine } from "../../../getEngine";
import type { RoomInfo } from "../../fighting/network/types";
import { NetworkManager } from "../../fighting/network/NetworkManager";
import { LobbyUIFactory, Button } from "../ui/LobbyUIFactory";

export class LobbyRoomListView extends Container {
  constructor(private networkManager: NetworkManager) {
    super();
  }

  public showRoomList(): void {
    this.removeChildren();
    this.networkManager.getRoomList();

    // 标题
    const title = new Text({
      text: "房间列表",
      style: { fontSize: 48, fill: 0xffffff, fontWeight: "bold" },
    });
    title.anchor.set(0.5);
    title.x = engine().screen.width / 2;
    title.y = 80;
    this.addChild(title);

    const refreshBtn = LobbyUIFactory.createButton(
      "刷新",
      engine().screen.width / 2 + 150,
      140,
      120,
      40,
      () => {
        this.networkManager.getRoomList();
      },
    );
    this.addButton(refreshBtn);

    const backBtn = LobbyUIFactory.createButton(
      "返回",
      engine().screen.width / 2 - 270,
      140,
      120,
      40,
      () => {
        this.emit("showMenu");
      },
    );
    this.addButton(backBtn);
  }

  public displayRoomList(rooms: RoomInfo[]): void {
    // 清除旧房间
    this.children
      .filter((child) => child.y >= 200)
      .forEach((child) => this.removeChild(child));

    // 显示房间
    rooms.forEach((room, index) => {
      const y = 200 + index * 100;
      const btn = LobbyUIFactory.createRoomItem(
        room.name,
        room.playerCount,
        room.maxPlayers,
        room.hasPassword,
        y,
        () => {
          this.emit("joinRoom", room);
        },
      );
      this.addButton(btn);
    });
  }

  private addButton(btn: Button): void {
    this.addChild(btn.bg);
    this.addChild(btn.text);

    btn.bg.eventMode = "static";
    btn.bg.cursor = "pointer";
    btn.bg.on("pointerdown", btn.onClick);
  }
}
