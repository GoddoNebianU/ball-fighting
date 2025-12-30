/**
 * 共享AI决策逻辑
 * 为AI玩家生成输入
 */

import { PlayerState, PlayerInput } from "../types";

export class AIDecision {
  /**
   * 为AI玩家生成输入
   * @param ai AI玩家状态
   * @param allPlayers 所有玩家状态
   * @returns AI输入
   */
  static generateAIInput(
    ai: PlayerState,
    allPlayers: PlayerState[],
  ): PlayerInput {
    // 找到最近的存活玩家
    let nearestDistance = Infinity;
    let targetDx = 0;
    let targetDy = 0;

    for (const other of allPlayers) {
      if (other.id === ai.id || other.isDead) continue;

      const dx = other.position.x - ai.position.x;
      const dy = other.position.y - ai.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        targetDx = dx;
        targetDy = dy;
      }
    }

    const input: PlayerInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
      block: false,
    };

    if (nearestDistance < 500) {
      if (nearestDistance > 100) {
        // 移动向目标
        input.up = targetDy < -30;
        input.down = targetDy > 30;
        input.left = targetDx < -30;
        input.right = targetDx > 30;
      } else {
        // 靠近目标，停止移动并攻击
        input.attack = Math.random() < 0.15; // 15%概率攻击
      }
    }

    return input;
  }
}
