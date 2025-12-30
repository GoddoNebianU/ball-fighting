import { Fighter } from "../fighter/Fighter";
import type { AttackData } from "../fighter/FighterTypes";
import { Bullet } from "./Bullet";
import { FightingGame } from "../FightingGame";

/** 子弹管理器 */
export class BulletManager {
  private game: FightingGame;
  private bullets: Bullet[] = [];

  constructor(game: FightingGame) {
    this.game = game;
  }

  public spawnBullet(
    shooter: Fighter,
    angle: number,
    attackData: AttackData,
  ): void {
    const bullet = new Bullet(
      shooter.x,
      shooter.y,
      angle,
      attackData.projectileSpeed || 800,
      attackData.damage,
      attackData.knockback,
      shooter,
    );
    this.bullets.push(bullet);
    this.game.addChild(bullet);
  }

  public checkCollisions(): void {
    const allFighters = this.game.players.getAllPlayers();

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      if (!bullet.active) {
        this.removeBullet(i);
        continue;
      }

      // 检查是否出界
      const halfWidth = FightingGame.CONFIG.stageWidth / 2;
      const halfHeight = FightingGame.CONFIG.stageHeight / 2;
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

      // 检查是否击中任何对手(除了射击者自己)
      for (const target of allFighters) {
        if (target === bullet.owner) continue; // 不击中自己

        const dx = bullet.x - target.x;
        const dy = bullet.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < Fighter.CONFIG.radius + 6) {
          // 击中!使用子弹的击退值
          target.takeHit(
            bullet.damage,
            bullet.knockback,
            bullet.owner.x,
            bullet.owner.y,
            bullet.owner,
          );
          bullet.deactivate();
          this.removeBullet(i);
          break; // 一颗子弹只击中一个目标
        }
      }
    }
  }

  public update(deltaTime: number): void {
    this.bullets.forEach((bullet) => bullet.update(deltaTime));
  }

  private removeBullet(index: number): void {
    const bullet = this.bullets[index];
    this.game.removeChild(bullet);
    this.bullets.splice(index, 1);
  }

  public clear(): void {
    this.bullets.forEach((bullet) => this.game.removeChild(bullet));
    this.bullets = [];
  }
}
