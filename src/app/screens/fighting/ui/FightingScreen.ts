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
  private restartButton: Button;
  private backButton: Button;

  constructor() {
    super();

    this.game = new FightingGame(GameMode.VS_CPU);

    this.restartButton = new Button({
      text: "Restart",
      width: 140,
      height: 50,
    });
    this.restartButton.x = 350;
    this.restartButton.y = -380;
    this.restartButton.onPress.connect(() => this.restart());

    this.backButton = new Button({
      text: "Back",
      width: 140,
      height: 50,
    });
    this.backButton.x = 40;
    this.backButton.y = 40;
    this.backButton.onPress.connect(() => this.goBack());

    this.addChild(this.game, this.restartButton, this.backButton);
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

    this.restartButton.x = centerX + width / 2 - 230;
    this.restartButton.y = centerY - height / 2 + 40;
  }

  public async show() {
    await this.game.loadEnemies();
    await this.game.start();
  }

  public async hide() {}

  public blur() {}

  private restart() {
    this.game.restart();
  }

  private goBack() {
    engine().navigation.showScreen(MainScreen);
  }
}
