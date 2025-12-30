import { Fighter } from "../fighter/Fighter";
import { Bullet } from "../combat/Bullet";
import { BulletManager } from "../combat/BulletManager";

/** AI子弹躲避系统 */
export class AIBulletDodge {
  private currentDodgeTimer: number = 0; // 当前躲避持续时间
  private readonly DODGE_DURATION = 500; // 每次躲避持续500ms
  private readonly DANGER_ZONE = 400; // 死区:只有子弹距离小于400px才躲避
  private savedDodgeInputs = {
    left: false,
    right: false,
    up: false,
    down: false,
    block: false,
  }; // 保存躲避输入,避免每帧重置
  private isDodgeDirectionLocked = false; // 锁定躲避方向,避免左右摇摆
  private smoothedDodgeX = 0; // 平滑后的X方向躲避值
  private smoothedDodgeY = 0; // 平滑后的Y方向躲避值
  private readonly SMOOTHING_FACTOR = 0.3; // 平滑系数 (0-1,越大越平滑) - 降低到0.3让躲避更快生效

  /** 检查并躲避子弹 */
  public checkAndDodgeBullets(
    ai: Fighter,
    bulletManager: BulletManager,
  ): boolean {
    const bullets = bulletManager["bullets"] as Bullet[];

    // 调试:每60帧输出一次状态
    if (Math.random() < 0.016) {
      console.log(
        `[BulletDodge] State - bullets: ${bullets.length}, locked: ${this.isDodgeDirectionLocked}, timer: ${this.currentDodgeTimer.toFixed(0)}ms`,
      );
    }

    if (bullets.length === 0) {
      this.currentDodgeTimer = 0;
      this.clearDodgeInputs(ai);
      this.resetSmoothing();
      return false;
    }

    let mostDangerousBullet: Bullet | null = null;
    let minTimeToImpact = Infinity;
    let bulletCheckCount = 0; // 调试:记录检查了多少颗子弹

    // 找到最危险的子弹(即将击中AI的子弹)
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      if (bullet.owner === ai) continue;

      bulletCheckCount++;

      // 计算子弹到AI的距离
      const dx = ai.x - bullet.x;
      const dy = ai.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 死区检查:子弹太远就不躲避
      if (dist > this.DANGER_ZONE) continue;

      const timeToImpact = this.calculateTimeToImpact(ai, bullet);

      if (timeToImpact > 0 && timeToImpact < minTimeToImpact) {
        minTimeToImpact = timeToImpact;
        mostDangerousBullet = bullet;
      }
    }

    // 调试:输出子弹检测情况
    if (bulletCheckCount > 0) {
      console.log(
        `[BulletDodge] Checked ${bulletCheckCount} bullets, mostDangerous: ${mostDangerousBullet ? "YES" : "NO"}, minTimeToImpact: ${minTimeToImpact.toFixed(0)}ms`,
      );
    }

    // 如果有危险子弹,执行躲避
    // 检测范围: 800ms内会击中的子弹 (缩小检测窗口,只在真正危险时躲避)
    if (mostDangerousBullet && minTimeToImpact < 800) {
      // 如果方向没有锁定,计算并锁定新方向
      if (!this.isDodgeDirectionLocked) {
        console.log(
          `[BulletDodge] Direction NOT locked, calculating new dodge direction`,
        );
        this.dodgeBullet(ai, mostDangerousBullet);
        this.isDodgeDirectionLocked = true;
        this.currentDodgeTimer = this.DODGE_DURATION; // 只在计算新方向时重置timer
      } else {
        console.log(`[BulletDodge] Direction locked, applying smoothed dodge`);
        // 方向已锁定,继续应用平滑后的躲避方向
        this.applySmoothedDodge(ai);
      }
      return true;
    }

    // 如果正在躲避中,继续保持躲避方向
    if (this.currentDodgeTimer > 0) {
      this.currentDodgeTimer -= 16; // 假设60fps,每帧约16ms
      console.log(
        `[BulletDodge] Still dodging, timer: ${this.currentDodgeTimer.toFixed(0)}ms`,
      );
      // 应用平滑后的躲避输入
      this.applySmoothedDodge(ai);
      return true;
    }

    // 没有危险子弹,解锁方向并重置平滑
    if (this.isDodgeDirectionLocked) {
      console.log(`[BulletDodge] No dangerous bullets, unlocking direction`);
      this.isDodgeDirectionLocked = false;
      this.resetSmoothing();
    }

    return false;
  }

  /** 应用平滑后的躲避输入 */
  private applySmoothedDodge(ai: Fighter): void {
    // 根据平滑值设置输入(添加死区避免抖动)
    const DEADZONE = 0.15; // 死区阈值 - 降低到0.15让躲避更灵敏

    ai.input.left = this.smoothedDodgeX < -DEADZONE;
    ai.input.right = this.smoothedDodgeX > DEADZONE;
    ai.input.up = this.smoothedDodgeY < -DEADZONE;
    ai.input.down = this.smoothedDodgeY > DEADZONE;
    ai.input.block = this.savedDodgeInputs.block;
  }

  /** 重置平滑值 */
  private resetSmoothing(): void {
    this.smoothedDodgeX = 0;
    this.smoothedDodgeY = 0;
  }

  /** 清空躲避输入 */
  private clearDodgeInputs(ai: Fighter): void {
    ai.input.left = false;
    ai.input.right = false;
    ai.input.up = false;
    ai.input.down = false;
    ai.input.block = false;
    this.savedDodgeInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
    };
  }

  /** 计算子弹击中AI的时间(毫秒) */
  private calculateTimeToImpact(ai: Fighter, bullet: Bullet): number {
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

  /** 躲避子弹 */
  private dodgeBullet(ai: Fighter, bullet: Bullet): void {
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
      `[BulletDodge] Dodging - perpDist: ${perpDist.toFixed(1)}, alongDist: ${alongDist.toFixed(1)}`,
    );

    // 判断子弹是否会击中AI
    // 如果沿子弹方向的距离是负的,说明子弹正在远离AI
    if (alongDist < 0) {
      // 子弹已经飞过AI或正在远离,不需要躲避
      console.log(`[BulletDodge] Bullet moving away, only blocking`);
      this.savedDodgeInputs.block = Math.random() < 0.8;
      this.applySmoothedDodge(ai);
      return;
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
      `[BulletDodge] Dodge direction: (${targetDodgeX.toFixed(2)}, ${targetDodgeY.toFixed(2)})`,
    );

    // 应用平滑滤波
    this.smoothedDodgeX =
      this.smoothedDodgeX * this.SMOOTHING_FACTOR +
      targetDodgeX * (1 - this.SMOOTHING_FACTOR);
    this.smoothedDodgeY =
      this.smoothedDodgeY * this.SMOOTHING_FACTOR +
      targetDodgeY * (1 - this.SMOOTHING_FACTOR);

    console.log(
      `[BulletDodge] Smoothed dodge: (${this.smoothedDodgeX.toFixed(2)}, ${this.smoothedDodgeY.toFixed(2)})`,
    );

    // 保存格挡状态
    this.savedDodgeInputs.block = Math.random() < 0.8;

    // 立即应用平滑后的输入
    this.applySmoothedDodge(ai);

    console.log(
      `[BulletDodge] Applied inputs - left: ${ai.input.left}, right: ${ai.input.right}, up: ${ai.input.up}, down: ${ai.input.down}, block: ${ai.input.block}`,
    );
  }

  public reset(): void {
    this.currentDodgeTimer = 0;
    this.isDodgeDirectionLocked = false;
    this.resetSmoothing();
    this.savedDodgeInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
    };
  }
}
