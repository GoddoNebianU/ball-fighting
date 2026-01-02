import { Fighter } from "../fighter/Fighter";
import type { AttackData } from "../fighter/FighterTypes";
import { Bullet } from "./Bullet";
import { FightingGame } from "../FightingGame";

export class BulletManager {
  private game: FightingGame;
  private bullets: Bullet[] = [];

  constructor(game: FightingGame) {
    this.game = game;
  }

  spawnBullet(shooter: Fighter, angle: number, attackData: AttackData): void {
    const bullet = new Bullet(
      shooter.x,
      shooter.y,
      angle,
      attackData.projectileSpeed || 800,
      attackData.damage,
      attackData.knockback,
      shooter,
      attackData.penetrating || false,
    );
    this.bullets.push(bullet);
    this.game.addChild(bullet);
  }

  checkCollisions(): void {
    const allFighters = this.game.players.getAllPlayers();
    const halfWidth = FightingGame.CONFIG.stageWidth / 2;
    const halfHeight = FightingGame.CONFIG.stageHeight / 2;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet.active) {
        this.removeBullet(i);
        continue;
      }
      if (
        bullet.x < -halfWidth ||
        bullet.x > halfWidth ||
        bullet.y < -halfHeight ||
        bullet.y > halfHeight
      ) {
        bullet.deactivate();
        this.removeBullet(i);
        continue;
      }
      for (const target of allFighters) {
        if (target === bullet.owner || bullet.hasHit(target)) continue;
        const dx = bullet.x - target.x,
          dy = bullet.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < Fighter.CONFIG.radius + 6) {
          target.takeHit(
            bullet.damage,
            bullet.knockback,
            bullet.owner.x,
            bullet.owner.y,
            bullet.owner,
          );
          bullet.markHit(target);
          if (!bullet.penetrating) {
            bullet.deactivate();
            this.removeBullet(i);
            break;
          }
        }
      }
    }
  }

  update(deltaTime: number): void {
    this.bullets.forEach((bullet) => bullet.update(deltaTime));
  }

  private removeBullet(index: number): void {
    this.game.removeChild(this.bullets[index]);
    this.bullets.splice(index, 1);
  }

  clear(): void {
    this.bullets.forEach((bullet) => this.game.removeChild(bullet));
    this.bullets = [];
  }
}
