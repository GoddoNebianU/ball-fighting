import { Fighter } from "../fighter/Fighter";
import { HealthPack } from "./HealthPack";
import { FightingGame } from "../FightingGame";

export class HealthPackManager {
  private game: FightingGame;
  private healthPacks: HealthPack[] = [];
  private spawnTimer = 0;
  private spawnInterval = 5000;

  constructor(game: FightingGame) {
    this.game = game;
  }

  update(deltaTime: number): void {
    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      if (Math.random() < 0.4) this.spawnHealthPack();
    }
    for (let i = this.healthPacks.length - 1; i >= 0; i--) {
      const pack = this.healthPacks[i];
      pack.update(deltaTime);
      if (!pack.active) this.removeHealthPack(i);
    }
    this.checkPickups();
  }

  private spawnHealthPack(): void {
    const pack = new HealthPack();
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
      this.game.players
        .getAllPlayers()
        .forEach((player) => this.checkPickup(player, pack));
    }
  }

  private checkPickup(player: Fighter, pack: HealthPack): void {
    if (!pack.active || player.isDead) return;
    const dx = player.x - pack.x,
      dy = player.y - pack.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < Fighter.CONFIG.radius + 15) {
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
    this.game.removeChild(this.healthPacks[index]);
    this.healthPacks.splice(index, 1);
  }

  getHealthPacks(): HealthPack[] {
    return this.healthPacks;
  }
  clear(): void {
    this.healthPacks.forEach((p) => this.game.removeChild(p));
    this.healthPacks = [];
    this.spawnTimer = 0;
  }
}
