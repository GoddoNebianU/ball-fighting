import { Fighter } from "../fighter/Fighter";
import { Bullet } from "../combat/Bullet";

/** 子弹威胁分析器 */
export class BulletThreatAnalyzer {
  /** 计算子弹击中 AI 的时间（毫秒） */
  public static calculateTimeToImpact(ai: Fighter, bullet: Bullet): number {
    const bulletSpeed = Math.sqrt(
      bullet.vx * bullet.vx + bullet.vy * bullet.vy,
    );

    if (bulletSpeed === 0) return Infinity;

    const dx = ai.x - bullet.x;
    const dy = ai.y - bullet.y;

    const bulletDirX = bullet.vx / bulletSpeed;
    const bulletDirY = bullet.vy / bulletSpeed;

    const projection = dx * bulletDirX + dy * bulletDirY;

    if (projection < 0) return Infinity;

    const perpDistance = Math.abs(dx * bulletDirY - dy * bulletDirX);
    const hitThreshold = Fighter.CONFIG.radius + 40;

    if (perpDistance > hitThreshold) return Infinity;

    const timeToImpact = (projection / bulletSpeed) * 1000;
    return timeToImpact;
  }

  /** 找到最危险的子弹 */
  public static findMostDangerousBullet(
    ai: Fighter,
    bullets: Bullet[],
    dangerZone: number,
  ): { bullet: Bullet | null; minTimeToImpact: number; checkedCount: number } {
    let mostDangerousBullet: Bullet | null = null;
    let minTimeToImpact = Infinity;
    let checkedCount = 0;

    for (const bullet of bullets) {
      if (!bullet.active) continue;
      if (bullet.owner === ai) continue;

      checkedCount++;

      const dx = ai.x - bullet.x;
      const dy = ai.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > dangerZone) continue;

      const timeToImpact = this.calculateTimeToImpact(ai, bullet);

      if (timeToImpact > 0 && timeToImpact < minTimeToImpact) {
        minTimeToImpact = timeToImpact;
        mostDangerousBullet = bullet;
      }
    }

    return { bullet: mostDangerousBullet, minTimeToImpact, checkedCount };
  }
}
