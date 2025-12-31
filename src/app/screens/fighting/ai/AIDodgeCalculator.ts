import { Fighter } from "../fighter/Fighter";
import { Bullet } from "../combat/Bullet";

/** AI子弹躲避计算系统 */
export class AIDodgeCalculator {
  /** 计算子弹击中AI的时间(毫秒) */
  public static calculateTimeToImpact(ai: Fighter, bullet: Bullet): number {
    // 计算子弹速度(像素/秒)
    const bulletSpeed = Math.sqrt(
      bullet.vx * bullet.vx + bullet.vy * bullet.vy,
    );

    if (bulletSpeed === 0) return Infinity;

    // 计算子弹到AI的向量
    const dx = ai.x - bullet.x;
    const dy = ai.y - bullet.y;

    // 计算子弹方向(标准化)
    const bulletDirX = bullet.vx / bulletSpeed;
    const bulletDirY = bullet.vy / bulletSpeed;

    // 计算AI在子弹运动方向的投影距离
    const projection = dx * bulletDirX + dy * bulletDirY;

    // 如果子弹正在远离AI,不会击中
    if (projection < 0) return Infinity;

    // 计算垂直距离(子弹轨迹到AI的最短距离)
    const perpDistance = Math.abs(dx * bulletDirY - dy * bulletDirX);

    // 如果垂直距离大于角色半径+容错,不会击中
    const hitThreshold = Fighter.CONFIG.radius + 40; // 增加容错到40像素,让AI更积极地躲避
    if (perpDistance > hitThreshold) return Infinity;

    // 计算击中时间(毫秒)
    // bulletSpeed单位是像素/秒,projection是像素
    // time = projection / bulletSpeed = 秒
    // 转换为毫秒
    const timeToImpact = (projection / bulletSpeed) * 1000;

    return timeToImpact;
  }

  /** 计算躲避方向 */
  public static calculateDodgeDirection(
    ai: Fighter,
    bullet: Bullet,
  ): { dodgeX: number; dodgeY: number; block: boolean } {
    // 清空当前输入
    ai.input.up = false;
    ai.input.down = false;
    ai.input.left = false;
    ai.input.right = false;
    ai.input.block = false;

    // 计算子弹速度向量
    const bulletSpeed = Math.sqrt(
      bullet.vx * bullet.vx + bullet.vy * bullet.vy,
    );
    const bulletDirX = bullet.vx / bulletSpeed;
    const bulletDirY = bullet.vy / bulletSpeed;

    // 计算AI相对于子弹的位置
    const dx = ai.x - bullet.x;
    const dy = ai.y - bullet.y;

    // 计算AI到子弹轨迹的垂直距离
    // 使用叉乘:正值在左侧,负值在右侧
    const perpDist = dx * bulletDirY - dy * bulletDirX;

    // 计算沿子弹方向的距离
    const alongDist = dx * bulletDirX + dy * bulletDirY;

    // 调试:输出关键数据
    console.log(
      `[AIDodgeCalculator] Dodging - perpDist: ${perpDist.toFixed(1)}, alongDist: ${alongDist.toFixed(1)}`,
    );

    // 判断子弹是否会击中AI
    // 如果沿子弹方向的距离是负的,说明子弹正在远离AI
    if (alongDist < 0) {
      // 子弹已经飞过AI或正在远离,不需要躲避
      console.log(`[AIDodgeCalculator] Bullet moving away, only blocking`);
      return {
        dodgeX: 0,
        dodgeY: 0,
        block: Math.random() < 0.8,
      };
    }

    // 计算目标躲避方向:垂直于子弹轨迹
    // 垂直向量
    const perpX = -bulletDirY;
    const perpY = bulletDirX;

    // 根据AI在轨迹的哪侧决定躲避方向
    // perpDist > 0 表示在左侧,应该向左(-perpX, -perpY)
    // perpDist < 0 表示在右侧,应该向右(+perpX, +perpY)
    const dodgeMultiplier = perpDist > 0 ? -1 : 1;

    // 设置目标躲避方向
    let targetDodgeX = perpX * dodgeMultiplier;
    let targetDodgeY = perpY * dodgeMultiplier;

    // 归一化并放大,确保躲避强度
    const dodgeLength = Math.sqrt(
      targetDodgeX * targetDodgeX + targetDodgeY * targetDodgeY,
    );
    if (dodgeLength > 0) {
      targetDodgeX /= dodgeLength;
      targetDodgeY /= dodgeLength;
    }

    console.log(
      `[AIDodgeCalculator] Dodge direction: (${targetDodgeX.toFixed(2)}, ${targetDodgeY.toFixed(2)})`,
    );

    return {
      dodgeX: targetDodgeX,
      dodgeY: targetDodgeY,
      block: Math.random() < 0.8,
    };
  }
}
