import { FightingGame } from "../FightingGame";
import { UIComponents } from "./UIComponents";

/** UI更新器 - 更新分数、武器信息等显示 */
export class UIUpdater {
  constructor(
    private components: UIComponents,
    private game: FightingGame,
  ) {}

  public updateTime(): void {
    // 不再更新时间显示
  }

  public updateScore(scores: number[]): void {
    // 动态更新分数显示 - 支持6个玩家
    const scoreTexts = [
      this.components.p1ScoreText,
      this.components.p2ScoreText,
      this.components.p3ScoreText,
      this.components.p4ScoreText,
      this.components.p5ScoreText,
      this.components.p6ScoreText,
    ];

    scoreTexts.forEach((text, index) => {
      if (index < scores.length) {
        text.text = scores[index].toString();
      } else {
        text.text = "0";
      }
    });
  }

  public updateRound(roundNumber: number): void {
    this.components.roundText.text = `ROUND ${roundNumber}`;
  }

  public updateWeaponText(): void {
    // 获取第一个人类玩家(用于UI显示)
    const humanPlayer = this.game.players.getFirstHumanPlayer();
    if (!humanPlayer) return;

    const currentWeapon = humanPlayer.currentWeapon;
    this.components.p1WeaponText.text = currentWeapon.getName();

    // 更新弹药显示
    const weaponState = humanPlayer.getCurrentWeaponState();
    if (!currentWeapon.hasInfiniteAmmo()) {
      if (weaponState.isReloading) {
        this.components.p1AmmoText.text = "RELOADING...";
        this.components.p1AmmoText.style.fill = 0xff0000;
      } else {
        this.components.p1AmmoText.text = `${weaponState.currentAmmo}/${weaponState.maxAmmo}`;
        this.components.p1AmmoText.style.fill =
          weaponState.currentAmmo < weaponState.maxAmmo * 0.3
            ? 0xff0000
            : 0xffff00;
      }
      this.components.p1AmmoText.visible = true;
    } else {
      this.components.p1AmmoText.visible = false;
    }
  }
}
