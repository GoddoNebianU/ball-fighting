import { Fighter } from "../fighter/Fighter";
import { Bullet } from "../combat/Bullet";
import { BulletManager } from "../combat/BulletManager";
import { BulletThreatAnalyzer } from "./BulletThreatAnalyzer";

/** AI子弹躲避系统 */
export class AIBulletDodge {
  private currentDodgeTimer: number = 0;
  private readonly DODGE_DURATION = 500;
  private readonly DANGER_ZONE = 400;
  private savedDodgeInputs = {
    left: false,
    right: false,
    up: false,
    down: false,
    block: false,
  };
  private isDodgeDirectionLocked = false;
  private smoothedDodgeX = 0;
  private smoothedDodgeY = 0;
  private readonly SMOOTHING_FACTOR = 0.3;
  private readonly DEADZONE = 0.15;

  public checkAndDodgeBullets(
    ai: Fighter,
    bulletManager: BulletManager,
  ): boolean {
    const bullets = bulletManager["bullets"] as Bullet[];

    if (bullets.length === 0) {
      this.currentDodgeTimer = 0;
      this.clearDodgeInputs(ai);
      this.resetSmoothing();
      return false;
    }

    const { bullet: mostDangerousBullet, minTimeToImpact } =
      BulletThreatAnalyzer.findMostDangerousBullet(
        ai,
        bullets,
        this.DANGER_ZONE,
      );

    if (mostDangerousBullet && minTimeToImpact < 800) {
      if (!this.isDodgeDirectionLocked) {
        this.dodgeBullet(ai, mostDangerousBullet);
        this.isDodgeDirectionLocked = true;
        this.currentDodgeTimer = this.DODGE_DURATION;
      } else {
        this.applySmoothedDodge(ai);
      }
      return true;
    }

    if (this.currentDodgeTimer > 0) {
      this.currentDodgeTimer -= 16;
      this.applySmoothedDodge(ai);
      return true;
    }

    if (this.isDodgeDirectionLocked) {
      this.isDodgeDirectionLocked = false;
      this.resetSmoothing();
    }

    return false;
  }

  private applySmoothedDodge(ai: Fighter): void {
    ai.input.left = this.smoothedDodgeX < -this.DEADZONE;
    ai.input.right = this.smoothedDodgeX > this.DEADZONE;
    ai.input.up = this.smoothedDodgeY < -this.DEADZONE;
    ai.input.down = this.smoothedDodgeY > this.DEADZONE;
    ai.input.block = this.savedDodgeInputs.block;
  }

  private resetSmoothing(): void {
    this.smoothedDodgeX = 0;
    this.smoothedDodgeY = 0;
  }

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

  private dodgeBullet(ai: Fighter, bullet: Bullet): void {
    ai.input.up = false;
    ai.input.down = false;
    ai.input.left = false;
    ai.input.right = false;
    ai.input.block = false;

    const bulletSpeed = Math.sqrt(
      bullet.vx * bullet.vx + bullet.vy * bullet.vy,
    );
    const bulletDirX = bullet.vx / bulletSpeed;
    const bulletDirY = bullet.vy / bulletSpeed;

    const dx = ai.x - bullet.x;
    const dy = ai.y - bullet.y;
    const perpDist = dx * bulletDirY - dy * bulletDirX;
    const alongDist = dx * bulletDirX + dy * bulletDirY;

    if (alongDist < 0) {
      this.savedDodgeInputs.block = Math.random() < 0.8;
      this.applySmoothedDodge(ai);
      return;
    }

    const perpX = -bulletDirY;
    const perpY = bulletDirX;
    const dodgeMultiplier = perpDist > 0 ? -1 : 1;

    let targetDodgeX = perpX * dodgeMultiplier;
    let targetDodgeY = perpY * dodgeMultiplier;

    const dodgeLength = Math.sqrt(
      targetDodgeX * targetDodgeX + targetDodgeY * targetDodgeY,
    );
    if (dodgeLength > 0) {
      targetDodgeX /= dodgeLength;
      targetDodgeY /= dodgeLength;
    }

    this.smoothedDodgeX =
      this.smoothedDodgeX * this.SMOOTHING_FACTOR +
      targetDodgeX * (1 - this.SMOOTHING_FACTOR);
    this.smoothedDodgeY =
      this.smoothedDodgeY * this.SMOOTHING_FACTOR +
      targetDodgeY * (1 - this.SMOOTHING_FACTOR);

    this.savedDodgeInputs.block = Math.random() < 0.8;
    this.applySmoothedDodge(ai);
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
