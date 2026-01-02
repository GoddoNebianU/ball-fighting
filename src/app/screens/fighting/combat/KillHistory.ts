/** 击杀记录 */
export interface KillRecord {
  killerName: string;
  victimName: string;
  timestamp: number;
  roundNumber: number;
}

/** 击杀历史管理器 */
export class KillHistory {
  private kills: KillRecord[] = [];
  private maxRecords = 10; // 最多保存10条记录

  /** 添加击杀记录 */
  public addKill(
    killerName: string,
    victimName: string,
    roundNumber: number,
  ): void {
    const kill: KillRecord = {
      killerName,
      victimName,
      timestamp: Date.now(),
      roundNumber,
    };

    this.kills.push(kill);

    // 保持记录数量
    if (this.kills.length > this.maxRecords) {
      this.kills.shift();
    }
  }

  /** 获取最近的击杀记录 */
  public getRecentKills(count: number = 5): KillRecord[] {
    return this.kills.slice(-count);
  }

  /** 获取所有记录 */
  public getAllKills(): KillRecord[] {
    return [...this.kills];
  }

  /** 获取某个玩家的击杀数 */
  public getKillCount(playerName: string): number {
    return this.kills.filter((k) => k.killerName === playerName).length;
  }

  /** 获取某个玩家的死亡数 */
  public getDeathCount(playerName: string): number {
    return this.kills.filter((k) => k.victimName === playerName).length;
  }

  /** 获取某个玩家被谁杀了多少次 */
  public getDeathsByKiller(victimName: string, killerName: string): number {
    return this.kills.filter(
      (k) => k.victimName === victimName && k.killerName === killerName,
    ).length;
  }

  /** 清空历史 */
  public clear(): void {
    this.kills = [];
  }

  /** 获取记录数量 */
  public get count(): number {
    return this.kills.length;
  }
}
