import { FightingGame } from "../FightingGame";
import { UITextFactory } from "./UITextFactory";
import { UILayout } from "./UILayout";
import { Text } from "pixi.js";

export class UIComponents {
  public timeText!: Text;
  public p1NameText!: Text;
  public p2NameText!: Text;
  public p3NameText!: Text;
  public p4NameText!: Text;
  public p5NameText!: Text;
  public p6NameText!: Text;
  public p1ScoreText!: Text;
  public p2ScoreText!: Text;
  public p3ScoreText!: Text;
  public p4ScoreText!: Text;
  public p5ScoreText!: Text;
  public p6ScoreText!: Text;
  public roundText!: Text;
  public winnerText!: Text;
  public controlHint!: Text;
  public p1WeaponText!: Text;
  public p1AmmoText!: Text;

  private nameTexts: Text[] = [];
  private scoreTexts: Text[] = [];

  constructor(game: FightingGame) {
    const names = game.players.getAllPlayerNames();
    const playerCount = game.players.getPlayerCount();

    this.createTexts(names);
    this.setupLayout();
    this.setVisiblePlayers(playerCount);
  }

  private createTexts(names: string[]): void {
    this.timeText = UITextFactory.createTimeText();

    this.p1NameText = UITextFactory.createNameText(names[0] || "P1", 0x4488ff);
    this.p2NameText = UITextFactory.createNameText(names[1] || "P2", 0xffff00);
    this.p3NameText = UITextFactory.createNameText(names[2] || "E1", 0xff6644);
    this.p4NameText = UITextFactory.createNameText(names[3] || "E2", 0x44ff44);
    this.p5NameText = UITextFactory.createNameText(names[4] || "E3", 0xff44ff);
    this.p6NameText = UITextFactory.createNameText(names[5] || "E4", 0xffff44);

    this.p1ScoreText = UITextFactory.createScoreText(0x4488ff);
    this.p2ScoreText = UITextFactory.createScoreText(0xffff00);
    this.p3ScoreText = UITextFactory.createScoreText(0xff6644);
    this.p4ScoreText = UITextFactory.createScoreText(0x44ff44);
    this.p5ScoreText = UITextFactory.createScoreText(0xff44ff);
    this.p6ScoreText = UITextFactory.createScoreText(0xffff44);

    this.roundText = UITextFactory.createRoundText();
    this.winnerText = UITextFactory.createWinnerText();
    this.controlHint = UITextFactory.createControlHint();
    this.controlHint.alpha = 0.7;

    this.p1WeaponText = UITextFactory.createWeaponText();
    this.p1AmmoText = UITextFactory.createAmmoText();

    this.nameTexts = [
      this.p1NameText,
      this.p2NameText,
      this.p3NameText,
      this.p4NameText,
      this.p5NameText,
      this.p6NameText,
    ];

    this.scoreTexts = [
      this.p1ScoreText,
      this.p2ScoreText,
      this.p3ScoreText,
      this.p4ScoreText,
      this.p5ScoreText,
      this.p6ScoreText,
    ];
  }

  private setupLayout(): void {
    UILayout.layoutTimeText(this.timeText);
    UILayout.layoutPlayerTexts(this.nameTexts, this.scoreTexts);
    UILayout.layoutRoundText(this.roundText);
    UILayout.layoutWinnerText(this.winnerText);
    UILayout.layoutControlHint(this.controlHint);
    UILayout.layoutWeaponText(this.p1WeaponText, this.p1AmmoText);
  }

  private setVisiblePlayers(count: number): void {
    this.p6NameText.visible = count >= 6;
    this.p6ScoreText.visible = count >= 6;

    this.p5NameText.visible = count >= 5;
    this.p5ScoreText.visible = count >= 5;

    this.p4NameText.visible = count >= 4;
    this.p4ScoreText.visible = count >= 4;

    this.p3NameText.visible = count >= 3;
    this.p3ScoreText.visible = count >= 3;

    if (count < 2) {
      this.p2NameText.visible = false;
      this.p2ScoreText.visible = false;
    }
  }
}
