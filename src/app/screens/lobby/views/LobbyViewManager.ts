/**
 * 大厅视图管理器
 * 管理菜单、房间列表、创建房间、等待房间等视图
 */

import { Container, Text, Graphics } from "pixi.js";
import { engine } from "../../../getEngine";
import type { RoomInfo, PlayerInfo } from "../../fighting/network/types";
import { NetworkManager } from "../../fighting/network/NetworkManager";
import { LobbyUIFactory, Button } from "../ui/LobbyUIFactory";
import { LobbyMenuView } from "./LobbyMenuView";
import { LobbyRoomListView } from "./LobbyRoomListView";
import { LobbyWaitingRoomView } from "./LobbyWaitingRoomView";

export class LobbyViewManager extends Container {
  public currentView: "menu" | "roomList" | "waiting" | "createRoom" | "input" =
    "menu";
  public currentRoomId: string = "";
  public currentRoomPlayers: PlayerInfo[] = [];
  public isRoomHost: boolean = false;
  private buttons: Button[] = [];
  private inputRoomName: string = "";

  private menuView: LobbyMenuView;
  private roomListView: LobbyRoomListView;
  private waitingRoomView: LobbyWaitingRoomView;

  constructor(
    private networkManager: NetworkManager,
    private onBackToMenu?: () => void,
  ) {
    super();

    this.menuView = new LobbyMenuView();
    this.roomListView = new LobbyRoomListView(networkManager);
    this.waitingRoomView = new LobbyWaitingRoomView(networkManager);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.menuView.on("showCreateRoom", () => {
      this.showCreateRoom();
    });

    this.menuView.on("showRoomList", () => {
      this.showRoomList();
    });

    this.roomListView.on("showMenu", () => {
      this.showMenu();
    });

    this.roomListView.on("joinRoom", (room: RoomInfo) => {
      this.joinRoom(room);
    });

    this.waitingRoomView.on("backToRoomList", () => {
      this.showRoomList();
    });
  }

  public clearView(): void {
    this.removeChildren();
    this.buttons.forEach((btn) => {
      if (btn.bg.parent) this.removeChild(btn.bg);
      if (btn.text.parent) this.removeChild(btn.text);
    });
    this.buttons = [];
  }

  public showMenu(): void {
    this.currentView = "menu";
    this.clearView();
    this.addChild(this.menuView);
    this.menuView.showMenu(this.onBackToMenu);
  }

  public showRoomList(): void {
    this.currentView = "roomList";
    this.clearView();
    this.addChild(this.roomListView);
    this.roomListView.showRoomList();
  }

  public displayRoomList(rooms: RoomInfo[]): void {
    if (this.currentView === "roomList") {
      this.roomListView.displayRoomList(rooms);
    }
  }

  public showCreateRoom(): void {
    this.currentView = "createRoom";
    this.clearView();

    // 如果没有输入过房间名称，生成一个默认的
    if (!this.inputRoomName) {
      this.inputRoomName = `房间_${Math.floor(Math.random() * 10000)}`;
    }

    // 标题
    const title = new Text({
      text: "创建房间",
      style: { fontSize: 48, fill: 0xffffff, fontWeight: "bold" },
    });
    title.anchor.set(0.5);
    title.x = engine().screen.width / 2;
    title.y = 80;
    this.addChild(title);

    // 房间名称输入提示
    const namePrompt = new Text({
      text: "房间名称: (点击输入)",
      style: { fontSize: 24, fill: 0xffffff, fontWeight: "bold" },
    });
    namePrompt.anchor.set(0.5);
    namePrompt.x = engine().screen.width / 2;
    namePrompt.y = 180;
    this.addChild(namePrompt);

    // 房间名称显示框
    const nameBox = new Graphics();
    nameBox
      .roundRect(engine().screen.width / 2 - 250, 210, 500, 50, 10)
      .fill({ color: 0x334455 })
      .stroke({ width: 2, color: 0x667788 });
    this.addChild(nameBox);

    const nameText = new Text({
      text: this.inputRoomName,
      style: { fontSize: 24, fill: 0xffffff },
    });
    nameText.anchor.set(0.5);
    nameText.x = engine().screen.width / 2;
    nameText.y = 235;
    this.addChild(nameText);

    // 点击名称框弹出输入
    nameBox.eventMode = "static";
    nameBox.cursor = "pointer";
    nameBox.on("pointerdown", () => {
      this.emit("requestNameInput", this.inputRoomName);
    });

    // 玩家人数设置
    const playersPrompt = new Text({
      text: "最大玩家数:",
      style: { fontSize: 24, fill: 0xffffff, fontWeight: "bold" },
    });
    playersPrompt.anchor.set(0.5);
    playersPrompt.x = engine().screen.width / 2;
    playersPrompt.y = 300;
    this.addChild(playersPrompt);

    let maxPlayers = 4;
    const playersText = new Text({
      text: `${maxPlayers} 人`,
      style: { fontSize: 28, fill: 0x44ff44, fontWeight: "bold" },
    });
    playersText.anchor.set(0.5);
    playersText.x = engine().screen.width / 2;
    playersText.y = 350;
    this.addChild(playersText);

    // 减少人数按钮
    const decreaseBtn = LobbyUIFactory.createButton(
      "-",
      engine().screen.width / 2 - 200,
      330,
      60,
      40,
      () => {
        if (maxPlayers > 2) {
          maxPlayers--;
          playersText.text = `${maxPlayers} 人`;
        }
      },
    );
    this.addButton(decreaseBtn);

    // 增加人数按钮
    const increaseBtn = LobbyUIFactory.createButton(
      "+",
      engine().screen.width / 2 + 140,
      330,
      60,
      40,
      () => {
        if (maxPlayers < 10) {
          maxPlayers++;
          playersText.text = `${maxPlayers} 人`;
        }
      },
    );
    this.addButton(increaseBtn);

    // 创建房间按钮
    const createBtn = LobbyUIFactory.createButton(
      "创建房间",
      engine().screen.width / 2 - 150,
      450,
      300,
      50,
      () => {
        console.log(
          "[LobbyViewManager] Creating room with name:",
          this.inputRoomName,
          "maxPlayers:",
          maxPlayers,
        );
        this.networkManager.createRoom({
          roomName: this.inputRoomName,
          password: "",
          maxPlayers: maxPlayers,
          playerConfig: {
            name: `Player_${Math.floor(Math.random() * 1000)}`,
            color: 0x4488ff,
          },
        });
      },
    );
    this.addButton(createBtn);

    const backBtn = LobbyUIFactory.createButton(
      "返回",
      engine().screen.width / 2 - 150,
      530,
      300,
      50,
      () => this.showMenu(),
    );
    this.addButton(backBtn);
  }

  public setRoomName(name: string): void {
    this.inputRoomName = name;
  }

  public showWaitingRoom(
    data:
      | {
          roomId: string;
          roomName: string;
          players: PlayerInfo[];
          yourPlayerId: string;
          isHost: boolean;
        }
      | unknown,
  ): void {
    const d = data as {
      roomId: string;
      roomName: string;
      players: PlayerInfo[];
      yourPlayerId: string;
      isHost: boolean;
    };
    this.currentView = "waiting";
    this.clearView();

    // 保存房间信息
    this.currentRoomId = d.roomId;
    this.currentRoomPlayers = d.players;
    this.isRoomHost = d.isHost;

    this.addChild(this.waitingRoomView);
    this.waitingRoomView.showWaitingRoom(d);
  }

  public updatePlayerList(): void {
    if (this.currentView === "waiting") {
      this.waitingRoomView.setCurrentPlayers(this.currentRoomPlayers);
      this.waitingRoomView.updatePlayerList();
    }
  }

  public showCountdown(countdown: number): void {
    this.clearView();

    const countdownText = new Text({
      text: `${countdown}`,
      style: { fontSize: 120, fill: 0xff4444, fontWeight: "bold" },
    });
    countdownText.anchor.set(0.5);
    countdownText.x = engine().screen.width / 2;
    countdownText.y = engine().screen.height / 2;
    this.addChild(countdownText);
  }

  public showError(error: string): void {
    this.clearView();

    const errorText = new Text({
      text: `错误: ${error}`,
      style: { fontSize: 32, fill: 0xff4444, fontWeight: "bold" },
    });
    errorText.anchor.set(0.5);
    errorText.x = engine().screen.width / 2;
    errorText.y = engine().screen.height / 2;
    this.addChild(errorText);

    setTimeout(() => {
      if (this.currentView === "menu") return;
      this.showMenu();
    }, 2000);
  }

  private inputTextRef: Text | null = null;
  private currentOnConfirm: ((value: string) => void) | null = null;

  public showInputOverlay(
    prompt: string,
    currentValue: string,
    onConfirm: (value: string) => void,
  ): void {
    this.currentOnConfirm = onConfirm;
    this.currentView = "input";
    this.clearView();

    const overlay = new Graphics();
    overlay
      .rect(0, 0, engine().screen.width, engine().screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.addChild(overlay);

    const promptText = new Text({
      text: prompt,
      style: { fontSize: 32, fill: 0xffffff, fontWeight: "bold" },
    });
    promptText.anchor.set(0.5);
    promptText.x = engine().screen.width / 2;
    promptText.y = engine().screen.height / 2 - 100;
    this.addChild(promptText);

    // 提示信息
    const hint = new Text({
      text: "输入完成后按 Enter 确认，按 Escape 取消",
      style: { fontSize: 18, fill: 0xaaaaaa },
    });
    hint.anchor.set(0.5);
    hint.x = engine().screen.width / 2;
    hint.y = engine().screen.height / 2 - 50;
    this.addChild(hint);

    const inputBox = new Graphics();
    inputBox
      .roundRect(
        engine().screen.width / 2 - 250,
        engine().screen.height / 2,
        500,
        60,
        10,
      )
      .fill({ color: 0x334455 })
      .stroke({ width: 2, color: 0x667788 });
    this.addChild(inputBox);

    this.inputTextRef = new Text({
      text: currentValue + "|",
      style: { fontSize: 28, fill: 0xffffff },
    });
    this.inputTextRef.anchor.set(0.5);
    this.inputTextRef.x = engine().screen.width / 2;
    this.inputTextRef.y = engine().screen.height / 2 + 30;
    this.addChild(this.inputTextRef);
  }

  public updateInputText(text: string): void {
    if (this.inputTextRef) {
      this.inputTextRef.text = text + "|";
    }
  }

  public confirmInput(): void {
    console.log(
      "[LobbyViewManager] confirmInput called",
      "currentOnConfirm:",
      this.currentOnConfirm,
      "inputTextRef:",
      this.inputTextRef,
    );
    if (this.currentOnConfirm && this.inputTextRef) {
      const value = this.inputTextRef.text.replace("|", "");
      console.log("[LobbyViewManager] Calling onConfirm with value:", value);
      this.currentOnConfirm(value);
      this.currentOnConfirm = null;
      this.inputTextRef = null;
    }
  }

  public cancelInput(): void {
    this.currentOnConfirm = null;
    this.inputTextRef = null;
    // 返回到上一个界面
    if (this.currentView === "input") {
      this.showCreateRoom();
    }
  }

  private addButton(btn: Button): void {
    this.buttons.push(btn);
    this.addChild(btn.bg);
    this.addChild(btn.text);

    btn.bg.eventMode = "static";
    btn.bg.cursor = "pointer";
    btn.bg.on("pointerdown", btn.onClick);
  }

  private joinRoom(room: RoomInfo): void {
    if (room.hasPassword) {
      this.showInputOverlay("输入密码:", "", (password) => {
        this.networkManager.joinRoom(room.id, password, {
          name: `Player_${Math.floor(Math.random() * 1000)}`,
          color: 0xff8844,
        });
      });
    } else {
      this.networkManager.joinRoom(room.id, undefined, {
        name: `Player_${Math.floor(Math.random() * 1000)}`,
        color: 0xff8844,
      });
    }
  }
}
