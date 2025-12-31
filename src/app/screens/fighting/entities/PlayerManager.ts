import { Fighter } from "../fighter/Fighter";

/** 玩家配置 */
export interface PlayerConfig {
  name: string;
  color: number;
  startX: number;
  startY: number;
  isAI: boolean;
}

/** 玩家管理器 - 统一管理所有角色 */
export class PlayerManager {
  private players: Fighter[];
  private scores: number[] = [];
  private configs: PlayerConfig[];

  constructor(configs: PlayerConfig[]) {
    this.configs = configs;
    this.players = configs.map((config) => new Fighter(config.color));
    this.scores = new Array(configs.length).fill(0);

    // 初始化位置
    this.resetAll();
  }

  /** 获取所有玩家 */
  public getAllPlayers(): Fighter[] {
    return this.players;
  }

  /** 获取存活玩家 */
  public getAlivePlayers(): Fighter[] {
    return this.players.filter((p) => !p.isDead && p.health > 0);
  }

  /** 根据索引获取玩家 */
  public getPlayer(index: number): Fighter {
    return this.players[index];
  }

  /** 获取玩家数量 */
  public getPlayerCount(): number {
    return this.players.length;
  }

  /** 获取玩家分数 */
  public getScore(index: number): number {
    return this.scores[index];
  }

  /** 获取所有分数 */
  public getAllScores(): number[] {
    return [...this.scores];
  }

  /** 增加玩家分数 */
  public addScore(index: number): void {
    this.scores[index]++;
  }

  /** 重置所有分数 */
  public resetScores(): void {
    this.scores = new Array(this.players.length).fill(0);
  }

  /** 重置所有玩家位置和状态 */
  public resetAll(): void {
    this.players.forEach((player, index) => {
      const config = this.configs[index];
      player.reset(config.startX, config.startY);
    });
  }

  /** 查找玩家索引 */
  public findPlayerIndex(player: Fighter): number {
    return this.players.indexOf(player);
  }

  /** 检查是否只有一个玩家存活 */
  public hasSingleSurvivor(): boolean {
    return this.getAlivePlayers().length <= 1;
  }

  /** 获取获胜者(如果只有一个存活) */
  public getWinner(): Fighter | null {
    const survivors = this.getAlivePlayers();
    return survivors.length === 1 ? survivors[0] : null;
  }

  /** 更新所有玩家(跳过死亡玩家) */
  public updateAll(deltaTime: number): void {
    this.players.forEach((player) => {
      if (!player.isDead) {
        player.update(deltaTime);
      } else {
        player.visible = false;
      }
    });
  }

  /** 获取AI玩家 */
  public getAIPlayers(): Fighter[] {
    return this.players.filter((_, index) => this.configs[index].isAI);
  }

  /** 获取人类玩家 */
  public getHumanPlayers(): Fighter[] {
    return this.players.filter((_, index) => !this.configs[index].isAI);
  }

  /** 获取第一个人类玩家(通常用于UI显示) */
  public getFirstHumanPlayer(): Fighter | null {
    const humanPlayers = this.getHumanPlayers();
    return humanPlayers.length > 0 ? humanPlayers[0] : null;
  }

  /** 获取玩家名称 */
  public getPlayerName(index: number): string {
    if (index >= 0 && index < this.configs.length) {
      return this.configs[index].name;
    }
    return `P${index + 1}`;
  }

  /** 获取所有玩家名称 */
  public getAllPlayerNames(): string[] {
    return this.configs.map((config) => config.name);
  }

  /** 获取玩家颜色 */
  public getPlayerColor(index: number): number {
    if (index >= 0 && index < this.configs.length) {
      return this.configs[index].color;
    }
    return 0xffffff;
  }

  /** 获取所有玩家颜色 */
  public getAllPlayerColors(): number[] {
    return this.configs.map((config) => config.color);
  }
}
