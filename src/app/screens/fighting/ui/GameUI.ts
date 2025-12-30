import { Container } from "pixi.js";

import { FightingGame } from "../FightingGame";
import { UIComponents } from "./UIComponents";
import { UIUpdater } from "./UIUpdater";
import { UIAnimations } from "./UIAnimations";

/** 游戏UI主类 - 管理所有UI元素和更新 */
export class GameUI {
  public readonly container: Container;
  private components: UIComponents;
  private updater: UIUpdater;
  private animations: UIAnimations;

  constructor(game: FightingGame) {
    this.container = new Container();
    this.components = new UIComponents(game);
    this.updater = new UIUpdater(this.components, game);
    this.animations = new UIAnimations(this.components, game);

    this.initUI();
  }

  private initUI(): void {
    this.container.addChild(
      this.components.timeText,
      this.components.p1NameText,
      this.components.p2NameText,
      this.components.p3NameText,
      this.components.p4NameText,
      this.components.p5NameText,
      this.components.p6NameText,
      this.components.p1ScoreText,
      this.components.p2ScoreText,
      this.components.p3ScoreText,
      this.components.p4ScoreText,
      this.components.p5ScoreText,
      this.components.p6ScoreText,
      this.components.roundText,
      this.components.winnerText,
      this.components.controlHint,
      this.components.p1WeaponText,
      this.components.p1AmmoText,
    );
  }

  public updateTime(): void {
    this.updater.updateTime();
  }

  public updateScore(scores: number[]): void {
    this.updater.updateScore(scores);
  }

  public updateRound(roundNumber: number): void {
    this.updater.updateRound(roundNumber);
  }

  public updateWeaponText(): void {
    this.updater.updateWeaponText();
  }

  public showRoundAnimation(onComplete: () => void): void {
    this.animations.showRoundAnimation(onComplete);
  }

  public showWinner(): void {
    this.animations.showWinner();
  }

  public hideWinner(): void {
    this.animations.hideWinner();
  }
}
