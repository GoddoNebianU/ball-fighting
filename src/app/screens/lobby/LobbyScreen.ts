/**
 * 房间大厅界面
 * 显示房间列表、创建房间、等待界面
 */

import { Container } from "pixi.js";
import { engine } from "../../getEngine";
import { NetworkManager } from "../fighting/network/NetworkManager";
import type { RoomInfo, PlayerInfo } from "../fighting/network/types";
import { MainScreen } from "../main/MainScreen";
import { LobbyViewManager } from "./views/LobbyViewManager";
import { LobbyInputHandler } from "./handlers/LobbyInputHandler";

export class LobbyScreen extends Container {
  public static assetBundles = ["main"];

  private networkManager: NetworkManager;
  private viewManager: LobbyViewManager;
  private inputHandler: LobbyInputHandler;

  constructor() {
    super();

    this.networkManager = NetworkManager.getInstance();
    this.inputHandler = new LobbyInputHandler();
    this.viewManager = new LobbyViewManager(this.networkManager, () => {
      engine().navigation.showScreen(MainScreen);
    });

    this.addChild(this.viewManager);
    this.setupEvents();
    this.setupViewManagerEvents();
    this.setupKeyboard();

    this.viewManager.showMenu();
  }

  private setupEvents(): void {
    this.networkManager.on("room:list", (data: unknown) => {
      const d = data as { rooms: RoomInfo[] };
      this.viewManager.displayRoomList(d.rooms);
    });

    this.networkManager.on("room:created", (data: unknown) => {
      console.log("房间已创建:", data);
      this.viewManager.showWaitingRoom(data);
    });

    this.networkManager.on("room:joined", (data: unknown) => {
      console.log("已加入房间:", data);
      this.viewManager.showWaitingRoom(data);
    });

    this.networkManager.on("room:player_joined", (data: unknown) => {
      const d = data as { playerInfo: PlayerInfo };
      console.log("玩家已加入:", d.playerInfo.name);
      if (this.viewManager.currentView === "waiting") {
        const exists = this.viewManager.currentRoomPlayers.some(
          (p) => p.id === d.playerInfo.id,
        );
        if (!exists) {
          this.viewManager.currentRoomPlayers.push(d.playerInfo);
          this.viewManager.updatePlayerList();
        }
      }
    });

    this.networkManager.on("room:player_left", (data: unknown) => {
      const d = data as { playerId: string };
      if (this.viewManager.currentView === "waiting") {
        this.viewManager.currentRoomPlayers =
          this.viewManager.currentRoomPlayers.filter(
            (p) => p.id !== d.playerId,
          );
        this.viewManager.updatePlayerList();
      }
    });

    this.networkManager.on("room:closed", (data: unknown) => {
      const d = data as { roomId: string; reason: string };
      if (d.roomId === this.viewManager.currentRoomId) {
        console.log("[LobbyScreen] 房间已关闭:", d.reason);
        this.viewManager.currentRoomId = "";
        this.viewManager.currentRoomPlayers = [];
        this.viewManager.isRoomHost = false;
        this.viewManager.showMenu();
      }
    });

    this.networkManager.on("game:starting", (data: unknown) => {
      const d = data as { countdown: number };
      console.log(
        "[LobbyScreen] Received game:starting event, countdown:",
        d.countdown,
      );
      this.viewManager.showCountdown(d.countdown);
    });

    this.networkManager.on("game:started", () => {
      console.log("[LobbyScreen] Received game:started event");
      this.startGame();
    });

    this.networkManager.on("room:error", (data: unknown) => {
      const error = data as { error: string };
      console.error("房间错误:", error.error);
      this.viewManager.showError(error.error);
    });

    this.networkManager.on("chat:message", (data: unknown) => {
      const msg = data as { playerName: string; message: string };
      console.log(`[聊天] ${msg.playerName}: ${msg.message}`);
    });
  }

  private setupKeyboard(): void {
    window.addEventListener("keydown", (e) => {
      console.log(
        "[LobbyScreen] Key pressed:",
        e.key,
        "currentView:",
        this.viewManager.currentView,
        "inputValue:",
        this.inputHandler.inputValue,
      );

      // 处理输入模式下的按键
      if (this.viewManager.currentView === "input") {
        if (e.key === "Enter") {
          console.log("[LobbyScreen] Enter key pressed, confirming input");
          // 确认输入
          this.viewManager.confirmInput();
          this.inputHandler.inputMode = "none";
          this.inputHandler.inputValue = "";
        } else if (e.key === "Escape") {
          console.log("[LobbyScreen] Escape key pressed, canceling input");
          // 取消输入
          this.viewManager.cancelInput();
          this.inputHandler.inputMode = "none";
          this.inputHandler.inputValue = "";
        } else if (e.key === "Backspace" || e.key === "Delete") {
          // 删除字符
          this.inputHandler.inputValue = this.inputHandler.inputValue.slice(
            0,
            -1,
          );
          this.viewManager.updateInputText(this.inputHandler.inputValue);
        } else if (
          e.key.length === 1 &&
          this.inputHandler.inputValue.length < 20
        ) {
          // 添加字符
          this.inputHandler.inputValue += e.key;
          this.viewManager.updateInputText(this.inputHandler.inputValue);
        }
      }
    });
  }

  private startGame(): void {
    console.log("[LobbyScreen] 游戏开始，切换到网络对战");
    // 切换到网络对战界面
    import("../fighting/ui/NetworkFightingScreen").then(
      ({ NetworkFightingScreen }) => {
        engine().navigation.showScreen(NetworkFightingScreen);
      },
    );
  }

  private setupViewManagerEvents(): void {
    this.viewManager.on("requestNameInput", (defaultName: string) => {
      this.inputHandler.inputMode = "name";
      this.inputHandler.inputPrompt = "输入房间名称:";
      this.inputHandler.inputValue = defaultName;
      this.viewManager.showInputOverlay(
        this.inputHandler.inputPrompt,
        this.inputHandler.inputValue,
        (value) => {
          console.log("[LobbyScreen] onConfirm callback called with:", value);
          this.inputHandler.inputValue = value;
          this.inputHandler.roomNameInput = value;
          this.inputHandler.inputMode = "none";
          this.inputHandler.inputValue = "";

          // 更新房间名称
          this.viewManager.setRoomName(value);

          // 刷新创建房间界面
          this.viewManager.showCreateRoom();
        },
      );
    });
  }
}
