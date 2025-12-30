import { Text } from "pixi.js";
import { FightingGame } from "../FightingGame";

/** UI 布局管理器 */
export class UILayout {
  public static layoutTimeText(timeText: Text): void {
    timeText.anchor.set(0.5);
    timeText.x = 0;
    timeText.y = -FightingGame.CONFIG.stageHeight / 2 + 50;
    timeText.visible = false;
  }

  public static layoutRoundText(roundText: Text): void {
    roundText.anchor.set(0.5);
    roundText.x = 0;
    roundText.y = -50;
    roundText.alpha = 0;
  }

  public static layoutWinnerText(winnerText: Text): void {
    winnerText.anchor.set(0.5);
    winnerText.x = 0;
    winnerText.y = 0;
    winnerText.visible = false;
  }

  public static layoutControlHint(controlHint: Text): void {
    controlHint.anchor.set(0.5);
    controlHint.x = 0;
    controlHint.y = FightingGame.CONFIG.stageHeight / 2 - 50;
  }

  public static layoutWeaponText(weaponText: Text, ammoText: Text): void {
    weaponText.anchor.set(0.5);
    weaponText.x = -FightingGame.CONFIG.stageWidth / 2 + 80;
    weaponText.y = -FightingGame.CONFIG.stageHeight / 2 + 110;

    ammoText.anchor.set(0.5);
    ammoText.x = -FightingGame.CONFIG.stageWidth / 2 + 80;
    ammoText.y = -FightingGame.CONFIG.stageHeight / 2 + 135;
  }

  public static layoutPlayerTexts(nameTexts: Text[], scoreTexts: Text[]): void {
    const startX = 80;
    const startY = 50;
    const offsetX = 120;
    const stepY = 30;

    for (let i = 0; i < 6; i++) {
      const isLeft = i % 2 === 0;
      const row = Math.floor(i / 2);

      const nameText = nameTexts[i];
      const scoreText = scoreTexts[i];

      nameText.anchor.set(0.5);
      nameText.x = isLeft
        ? -FightingGame.CONFIG.stageWidth / 2 + startX
        : FightingGame.CONFIG.stageWidth / 2 - startX;
      nameText.y = -FightingGame.CONFIG.stageHeight / 2 + startY + row * stepY;

      scoreText.anchor.set(0.5);
      scoreText.x = isLeft
        ? -FightingGame.CONFIG.stageWidth / 2 + startX + offsetX
        : FightingGame.CONFIG.stageWidth / 2 - startX - offsetX;
      scoreText.y = nameText.y;
    }
  }
}
