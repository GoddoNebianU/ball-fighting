import { Fighter } from "../fighter/Fighter";
import { HealthPack } from "./HealthPack";
import { FightingGame } from "../FightingGame";

/** 血包管理器 */
export class HealthPackManager {
  private game: FightingGame;
  private healthPacks: HealthPack[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 5000; // 每5秒尝试生成一个

  constructor(game: FightingGame) {
    this.game = game;
  }

  public update(deltaTime: number): void {
    this.spawnTimer -= deltaTime;

    // 定时生成血包
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      if (Math.random() < 0.4) {
        // 40%概率生成
        this.spawnHealthPack();
      }
    }

    // 更新所有血包
    for (let i = this.healthPacks.length - 1; i >= 0; i--) {
      const pack = this.healthPacks[i];
      pack.update(deltaTime);

      if (!pack.active) {
        this.removeHealthPack(i);
      }
    }

    // 检测拾取
    this.checkPickups();
  }

  private spawnHealthPack(): void {
    const pack = new HealthPack();

    // 随机位置,但不要太靠近边缘
    const margin = 100;
    const stageWidth = FightingGame.CONFIG.stageWidth - margin * 2;
    const stageHeight = FightingGame.CONFIG.stageHeight - margin * 2;

    pack.x =
      -FightingGame.CONFIG.stageWidth / 2 + margin + Math.random() * stageWidth;
    pack.y =
      -FightingGame.CONFIG.stageHeight / 2 +
      margin +
      Math.random() * stageHeight;

    this.healthPacks.push(pack);
    this.game.addChild(pack);
  }

  private checkPickups(): void {
    for (const pack of this.healthPacks) {
      if (!pack.active) continue;

      // 动态检查所有玩家
      const allPlayers = this.game.players.getAllPlayers();
      allPlayers.forEach((player) => {
        this.checkPickup(player, pack);
      });
    }
  }

  private checkPickup(player: Fighter, pack: HealthPack): void {
    if (!pack.active || player.isDead) return;

    const dx = player.x - pack.x;
    const dy = player.y - pack.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < Fighter.CONFIG.radius + 15) {
      // 拾取血包
      const healAmount = Math.min(
        pack.healAmount,
        Fighter.CONFIG.maxHealth - player.health,
      );
      player.health += healAmount;
      pack.active = false;
      pack.visible = false;
      console.log(
        `Player picked up health pack! Healed: ${healAmount.toFixed(0)}`,
      );
    }
  }

  private removeHealthPack(index: number): void {
    const pack = this.healthPacks[index];
    this.game.removeChild(pack);
    this.healthPacks.splice(index, 1);
  }

  public getHealthPacks(): HealthPack[] {
    return this.healthPacks;
  }

  public clear(): void {
    this.healthPacks.forEach((pack) => this.game.removeChild(pack));
    this.healthPacks = [];
    this.spawnTimer = 0;
  }
}
