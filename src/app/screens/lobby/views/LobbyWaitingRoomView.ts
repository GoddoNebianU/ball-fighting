/**
 * 大厅等待房间视图
 */

import { Container, Text } from "pixi.js";
import { engine } from "../../../getEngine";
import type { PlayerInfo } from "../../fighting/network/types";
import { NetworkManager } from "../../fighting/network/NetworkManager";
import { LobbyUIFactory, Button } from "../ui/LobbyUIFactory";

export class LobbyWaitingRoomView extends Container {
  private currentPlayers: PlayerInfo[] = [];
  private buttons: Button[] = [];

  constructor(private networkManager: NetworkManager) {
    super();
  }

  public showWaitingRoom(data: {
    roomId: string;
    roomName: string;
    players: PlayerInfo[];
    yourPlayerId: string;
    isHost: boolean;
  }): void {
    console.log("[LobbyWaitingRoomView] showWaitingRoom called with:", data);
    this.removeChildren();
    this.buttons = [];
    this.currentPlayers = data.players;

    // 标题
    const title = new Text({
      text: "等待房间",
      style: { fontSize: 40, fill: 0xffffff, fontWeight: "bold" },
    });
    title.anchor.set(0.5);
    title.x = engine().screen.width / 2;
    title.y = 80;
    this.addChild(title);

    // 房间信息
    const infoText = new Text({
      text: `房间: ${data.roomName}`,
      style: { fontSize: 28, fill: 0x44ff44, fontWeight: "bold" },
    });
    infoText.anchor.set(0.5);
    infoText.x = engine().screen.width / 2;
    infoText.y = 140;
    this.addChild(infoText);

    this.updatePlayerList();

    if (data.isHost) {
      const startBtn = LobbyUIFactory.createButton(
        "开始游戏",
        engine().screen.width / 2 - 150,
        620,
        300,
        50,
        () => {
          this.networkManager.startGame();
        },
      );
      this.addButton(startBtn);
    }

    const leaveBtn = LobbyUIFactory.createButton(
      "离开房间",
      engine().screen.width / 2 - 150,
      700,
      300,
      50,
      () => {
        this.networkManager.leaveRoom();
        this.emit("backToRoomList");
      },
    );
    this.addButton(leaveBtn);
  }

  public updatePlayerList(): void {
    // 清除旧列表
    this.children
      .filter(
        (child) =>
          child.y >= 200 &&
          child.y <= 600 &&
          !this.buttons.some((btn) => btn.bg === child || btn.text === child),
      )
      .forEach((child) => this.removeChild(child));

    // 显示玩家数量
    const countText = new Text({
      text: `玩家: ${this.currentPlayers.length} 人`,
      style: { fontSize: 20, fill: 0xffffff, fontWeight: "bold" },
    });
    countText.anchor.set(0.5);
    countText.x = engine().screen.width / 2;
    countText.y = 240;
    this.addChild(countText);

    // 显示玩家列表
    this.currentPlayers.forEach((player, index) => {
      const { container } = LobbyUIFactory.createPlayerListItem(
        player.name,
        player.isHost,
        index,
      );
      this.addChild(container);
    });
  }

  public setCurrentPlayers(players: PlayerInfo[]): void {
    this.currentPlayers = players;
  }

  private addButton(btn: Button): void {
    this.buttons.push(btn);
    this.addChild(btn.bg);
    this.addChild(btn.text);

    btn.bg.eventMode = "static";
    btn.bg.cursor = "pointer";
    btn.bg.on("pointerdown", btn.onClick);
  }
}
