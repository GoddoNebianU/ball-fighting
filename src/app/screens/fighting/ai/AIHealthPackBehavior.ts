import { Fighter } from "../fighter/Fighter";
import { HealthPack } from "../entities/HealthPack";

/** AI血包行为系统 */
export class AIHealthPackBehavior {
  private targetHealthPack: { x: number; y: number } | null = null;

  public checkForHealthPack(ai: Fighter, healthPacks: HealthPack[]): void {
    // 找到最近的血包
    let nearestPack: { x: number; y: number } | null = null;
    let minDist = Infinity;

    for (const pack of healthPacks) {
      if (!pack.active) continue;

      const dx = pack.x - ai.x;
      const dy = pack.y - ai.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 只考虑距离不太远的血包(500像素以内)
      if (dist < 500 && dist < minDist) {
        minDist = dist;
        nearestPack = { x: pack.x, y: pack.y };
      }
    }

    this.targetHealthPack = nearestPack;
  }

  public moveToHealthPack(ai: Fighter): boolean {
    if (!this.targetHealthPack) {
      this.targetHealthPack = null;
      return false;
    }

    const dx = this.targetHealthPack.x - ai.x;
    const dy = this.targetHealthPack.y - ai.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 如果已经到达血包位置,清除目标
    if (dist < 30) {
      this.targetHealthPack = null;
      return false;
    }

    // 移动向血包
    ai.input.up = dy < -10;
    ai.input.down = dy > 10;
    ai.input.left = dx < -10;
    ai.input.right = dx > 10;
    return true;
  }

  public hasTarget(): boolean {
    return this.targetHealthPack !== null;
  }

  public clearTarget(): void {
    this.targetHealthPack = null;
  }

  public reset(): void {
    this.targetHealthPack = null;
  }
}
