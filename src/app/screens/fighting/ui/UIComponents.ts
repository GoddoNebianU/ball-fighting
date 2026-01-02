import { Text } from "pixi.js";

import { FightingGame } from "../FightingGame";

/** UI组件管理 - 创建和管理所有UI文本元素 */
export class UIComponents {
  public timeText: Text;
  public p1NameText: Text;
  public p2NameText: Text;
  public p3NameText: Text;
  public p4NameText: Text;
  public p5NameText: Text;
  public p6NameText: Text;
  public p1ScoreText: Text;
  public p2ScoreText: Text;
  public p3ScoreText: Text;
  public p4ScoreText: Text;
  public p5ScoreText: Text;
  public p6ScoreText: Text;
  public roundText: Text;
  public winnerText: Text;
  public controlHint: Text;
  public p1WeaponText: Text;
  public p1AmmoText: Text;

  constructor(game: FightingGame) {
    // 处理 players 尚未初始化的情况
    const names = game.players?.getAllPlayerNames() || [];
    const colors = game.players?.getAllPlayerColors() || [];
    const playerCount = game.players?.getPlayerCount() || 0;

    this.timeText = new Text({
      text: "99",
      style: { fontSize: 48, fill: 0xffffff, fontWeight: "bold" },
    });
    this.p1NameText = new Text({
      text: names[0] || "P1",
      style: { fontSize: 24, fill: colors[0] || 0x4488ff, fontWeight: "bold" },
    });
    this.p2NameText = new Text({
      text: names[1] || "P2",
      style: { fontSize: 24, fill: colors[1] || 0xffff00, fontWeight: "bold" },
    });
    this.p3NameText = new Text({
      text: names[2] || "E1",
      style: { fontSize: 24, fill: colors[2] || 0xff6644, fontWeight: "bold" },
    });
    this.p4NameText = new Text({
      text: names[3] || "E2",
      style: { fontSize: 24, fill: colors[3] || 0x44ff44, fontWeight: "bold" },
    });
    this.p5NameText = new Text({
      text: names[4] || "E3",
      style: { fontSize: 24, fill: colors[4] || 0xff44ff, fontWeight: "bold" },
    });
    this.p6NameText = new Text({
      text: names[5] || "E4",
      style: { fontSize: 24, fill: colors[5] || 0xffff44, fontWeight: "bold" },
    });
    this.p1ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[0] || 0x4488ff, fontWeight: "bold" },
    });
    this.p2ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[1] || 0xffff00, fontWeight: "bold" },
    });
    this.p3ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[2] || 0xff6644, fontWeight: "bold" },
    });
    this.p4ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[3] || 0x44ff44, fontWeight: "bold" },
    });
    this.p5ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[4] || 0xff44ff, fontWeight: "bold" },
    });
    this.p6ScoreText = new Text({
      text: "0",
      style: { fontSize: 36, fill: colors[5] || 0xffff44, fontWeight: "bold" },
    });
    this.roundText = new Text({
      text: "ROUND 1",
      style: { fontSize: 72, fill: 0xffff00, fontWeight: "bold" },
    });
    this.winnerText = new Text({
      text: "",
      style: { fontSize: 64, fill: 0xff0000, fontWeight: "bold" },
    });
    this.controlHint = new Text({
      text: "WASD: Move | J: Fist | K: Pistol | L: MG | I: Sniper | Space: Block",
      style: { fontSize: 14, fill: 0xffffff },
    });
    this.controlHint.alpha = 0.7;
    this.p1WeaponText = new Text({
      text: "Pistol",
      style: { fontSize: 20, fill: 0xffffff, fontWeight: "bold" },
    });
    this.p1AmmoText = new Text({
      text: "",
      style: { fontSize: 16, fill: 0xffff00, fontWeight: "bold" },
    });

    this.layoutUI();
    this.setVisiblePlayers(playerCount);
  }

  /** 根据玩家数量显示对应的UI元素 */
  private setVisiblePlayers(count: number): void {
    // 根据玩家数量调整显示
    this.p6NameText.visible = count >= 6;
    this.p6ScoreText.visible = count >= 6;

    this.p5NameText.visible = count >= 5;
    this.p5ScoreText.visible = count >= 5;

    this.p4NameText.visible = count >= 4;
    this.p4ScoreText.visible = count >= 4;

    this.p3NameText.visible = count >= 3;
    this.p3ScoreText.visible = count >= 3;

    // P1和P2始终显示(如果有至少1个玩家)
    if (count < 2) {
      this.p2NameText.visible = false;
      this.p2ScoreText.visible = false;
    }
  }

  private layoutUI(): void {
    this.timeText.anchor.set(0.5);
    this.timeText.x = 0;
    this.timeText.y = -FightingGame.CONFIG.stageHeight / 2 + 50;
    this.timeText.visible = false; // 隐藏时间显示

    // 动态布局玩家UI - 全部在左上方
    const nameTexts = [
      this.p1NameText,
      this.p2NameText,
      this.p3NameText,
      this.p4NameText,
      this.p5NameText,
      this.p6NameText,
    ];
    const scoreTexts = [
      this.p1ScoreText,
      this.p2ScoreText,
      this.p3ScoreText,
      this.p4ScoreText,
      this.p5ScoreText,
      this.p6ScoreText,
    ];

    // 所有名字都在左上方垂直排列
    const startX = 60;
    const startY = 50;
    const scoreOffsetX = 100; // 分数在名字右侧
    const stepY = 25; // 每个玩家之间的Y间距

    for (let i = 0; i < 6; i++) {
      const nameText = nameTexts[i];
      const scoreText = scoreTexts[i];

      // 设置名称位置（左对齐）
      nameText.anchor.set(0, 0.5);
      nameText.x = -FightingGame.CONFIG.stageWidth / 2 + startX;
      nameText.y = -FightingGame.CONFIG.stageHeight / 2 + startY + i * stepY;

      // 设置分数位置（在名称右侧）
      scoreText.anchor.set(0, 0.5);
      scoreText.x = nameText.x + scoreOffsetX;
      scoreText.y = nameText.y;
    }

    this.roundText.anchor.set(0.5);
    this.roundText.x = 0;
    this.roundText.y = -50;
    this.roundText.alpha = 0;

    this.winnerText.anchor.set(0.5);
    this.winnerText.x = 0;
    this.winnerText.y = 0;
    this.winnerText.visible = false;

    this.controlHint.anchor.set(0.5);
    this.controlHint.x = 0;
    this.controlHint.y = FightingGame.CONFIG.stageHeight / 2 - 50;

    this.p1WeaponText.anchor.set(0.5);
    this.p1WeaponText.x = 0; // 中上位置
    this.p1WeaponText.y = -FightingGame.CONFIG.stageHeight / 2 + 80;

    this.p1AmmoText.anchor.set(0.5);
    this.p1AmmoText.x = 0; // 中上位置
    this.p1AmmoText.y = -FightingGame.CONFIG.stageHeight / 2 + 105;
  }

  /** 更新玩家名称（在加载敌人后调用） */
  updatePlayerNames(game: FightingGame): void {
    if (!game.players) return;

    const names = game.players.getAllPlayerNames();
    const colors = game.players.getAllPlayerColors();
    const playerCount = game.players.getPlayerCount();

    const nameTexts = [
      this.p1NameText,
      this.p2NameText,
      this.p3NameText,
      this.p4NameText,
      this.p5NameText,
      this.p6NameText,
    ];

    for (let i = 0; i < 6; i++) {
      nameTexts[i].text = names[i] || `P${i + 1}`;
      nameTexts[i].style = {
        ...nameTexts[i].style,
        fill: colors[i] || 0x4488ff,
      };
    }

    this.setVisiblePlayers(playerCount);
  }
}
