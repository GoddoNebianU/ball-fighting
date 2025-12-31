import { Fighter } from "./fighter/Fighter";
import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { GameInput } from "./GameInput";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameCollision } from "./GameCollision";

/** 游戏循环系统 */
export class GameLoop {
  private bullets: BulletManager;
  private effectManager: EffectManager;
  private healthPacks: HealthPackManager;
  private ui: GameUI;
  private ai: GameAI;
  private players: Fighter[];
  private collision: GameCollision;
  private onGameOverCallback?: () => void;

  private lastTime: number = 0;
  private gameRunning: boolean = false;
  private gameOverTriggered: boolean = false; // 防止重复触发

  constructor(
    bullets: BulletManager,
    effectManager: EffectManager,
    healthPacks: HealthPackManager,
    _input: GameInput,
    ui: GameUI,
    ai: GameAI,
    players: Fighter[],
    onGameOverCallback?: () => void,
  ) {
    this.bullets = bullets;
    this.effectManager = effectManager;
    this.healthPacks = healthPacks;
    this.ui = ui;
    this.ai = ai;
    this.players = players;
    this.collision = new GameCollision(players);
    this.onGameOverCallback = onGameOverCallback;
  }

  public update(currentTime: number): void {
    if (!this.gameRunning) return;

    const deltaTime = this.lastTime ? currentTime - this.lastTime : 16;
    this.lastTime = currentTime;

    // 不再更新时间限制
    this.ui.updateTime();

    // 更新AI
    this.ai.update(deltaTime);

    // 更新所有玩家
    this.players.forEach((player) => player.update(deltaTime));

    // 更新UI弹药显示
    this.ui.updateWeaponText();

    // 更新子弹
    this.bullets.update(deltaTime);

    // 更新射击特效
    this.effectManager.update();

    // 更新血包
    this.healthPacks.update(deltaTime);

    // 限制位置
    this.collision.clampPositions(1200, 800);

    // 碰撞检测
    this.bullets.checkCollisions();
    this.checkMeleeCollisions();

    // 再次限制位置
    this.collision.clampPositions(1200, 800);

    // 检测游戏结束（不再检测时间限制）
    this.checkGameOver();
  }

  private checkMeleeCollisions(): void {
    // 首先生成所有投射物攻击的子弹和特效
    for (const player of this.players) {
      const attack = player.getCurrentAttack();
      if (
        attack.isActive &&
        attack.data &&
        attack.data.projectile &&
        !attack.hasHit
      ) {
        // 生成射击特效
        this.effectManager.createShootingEffect(
          player,
          player.currentWeapon,
          attack.angle,
        );
        // 生成子弹
        this.bullets.spawnBullet(player, attack.angle, attack.data);
        player.markHit(); // 标记已生成子弹
      }
    }

    // 然后检测近战攻击碰撞
    this.collision.checkMeleeCollisions((target, data, attacker) => {
      target.takeHit(
        data.damage,
        data.knockback,
        attacker.x,
        attacker.y,
        attacker,
      );
    });
  }

  private checkGameOver(): boolean {
    const aliveFighters = this.players.filter((p) => !p.isDead);

    if (aliveFighters.length <= 1) {
      if (!this.gameOverTriggered) {
        this.gameOverTriggered = true;
        this.gameRunning = false;

        // 显示获胜者
        this.ui.showWinner();

        // 触发游戏结束回调（2秒后自动开启下一局）
        if (this.onGameOverCallback) {
          setTimeout(() => {
            this.onGameOverCallback?.();
            this.gameOverTriggered = false; // 重置标志
          }, 2000);
        }
      }

      return true;
    }
    return false;
  }

  public setGameRunning(running: boolean): void {
    this.gameRunning = running;
  }

  public isGameRunning(): boolean {
    return this.gameRunning;
  }

  public resetTime(): void {
    this.lastTime = 0;
  }

  public updatePlayersList(players: Fighter[]): void {
    this.players = players;
    this.collision.updateFighters(players);
  }
}
