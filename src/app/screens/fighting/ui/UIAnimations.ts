import { FightingGame } from "../FightingGame";
import { UIComponents } from "./UIComponents";

/** UI动画管理器 - 处理回合动画和胜利显示 */
export class UIAnimations {
  constructor(
    private components: UIComponents,
    private game: FightingGame,
  ) {}

  public showRoundAnimation(onComplete: () => void): void {
    this.components.roundText.alpha = 1;
    const fadeOut = () => {
      let alpha = this.components.roundText.alpha;
      const interval = setInterval(() => {
        alpha -= 0.02;
        this.components.roundText.alpha = alpha;
        if (alpha <= 0) {
          clearInterval(interval);
          onComplete();
        }
      }, 30);
    };
    setTimeout(fadeOut, 1000);
  }

  public showWinner(): void {
    let winnerText = "";
    const aliveFighters = this.game.players.getAlivePlayers();

    if (aliveFighters.length === 1) {
      const winner = aliveFighters[0];
      const winnerIndex = this.game.players.findPlayerIndex(winner);
      const winnerName = this.game.players.getPlayerName(winnerIndex);

      // 使用配置的名称生成胜利文本
      winnerText = `${winnerName} WINS!`;
    } else {
      winnerText = "DRAW!";
    }

    this.components.winnerText.text = winnerText;
    this.components.winnerText.visible = true;
  }

  public hideWinner(): void {
    this.components.winnerText.visible = false;
  }
}
