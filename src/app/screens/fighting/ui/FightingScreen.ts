import { FancyButton } from "@pixi/ui";
import { Container } from "pixi.js";

import { engine } from "../../../getEngine";
import { Button } from "../../../ui/Button";
import { FightingGame } from "../FightingGame";
import { GameMode } from "../types";
import { MainScreen } from "../../main/MainScreen";

/** 格斗游戏屏幕 */
export class FightingScreen extends Container {
  public static assetBundles = ["main"];

  private game: FightingGame;
  private backButton: FancyButton;
  private modeButton: Button;
  private restartButton: Button;

  constructor() {
    super();

    this.game = new FightingGame(GameMode.VS_CPU);

    this.backButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: {
        hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    });
    this.backButton.onPress.connect(() => this.goBack());
    this.backButton.x = 40;
    this.backButton.y = 40;

    this.modeButton = new Button({
      text: "Mode: VS CPU",
      width: 180,
      height: 50,
    });
    this.modeButton.x = -350;
    this.modeButton.y = -380;
    this.modeButton.onPress.connect(() => this.toggleMode());

    this.restartButton = new Button({
      text: "Restart",
      width: 140,
      height: 50,
    });
    this.restartButton.x = 350;
    this.restartButton.y = -380;
    this.restartButton.onPress.connect(() => this.restart());

    this.addChild(
      this.game,
      this.backButton,
      this.modeButton,
      this.restartButton,
    );
  }

  public prepare() {}

  public update() {
    this.game.update(performance.now());
  }

  public async pause() {}

  public async resume() {}

  public reset() {
    this.game.reset();
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.game.x = centerX;
    this.game.y = centerY;

    this.modeButton.x = centerX - width / 2 + 100;
    this.modeButton.y = centerY - height / 2 + 40;

    this.restartButton.x = centerX + width / 2 - 230;
    this.restartButton.y = centerY - height / 2 + 40;
  }

  public async show() {
    await this.game.start();
  }

  public async hide() {}

  public blur() {}

  private toggleMode() {
    const newMode =
      this.game.mode === GameMode.VS_CPU ? GameMode.VS_2P : GameMode.VS_CPU;
    this.game = new FightingGame(newMode);

    const centerX = this.parent?.width ? this.parent.width / 2 : 0;
    const centerY = this.parent?.height ? this.parent.height / 2 : 0;

    this.game.x = centerX;
    this.game.y = centerY;

    this.removeChildAt(0);
    this.addChildAt(this.game, 0);

    this.modeButton.text =
      newMode === GameMode.VS_CPU ? "Mode: VS CPU" : "Mode: VS 2P";

    this.game.start();
  }

  private restart() {
    this.game.restart();
  }

  private goBack() {
    engine().navigation.showScreen(MainScreen);
  }
}
