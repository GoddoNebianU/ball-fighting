import { Fighter } from "./fighter/Fighter";
import { BulletManager } from "./combat/BulletManager";
import { EffectManager } from "./combat/EffectManager";
import { HealthPackManager } from "./entities/HealthPackManager";
import { GameInput } from "./GameInput";
import { GameUI } from "./ui/GameUI";
import { GameAI } from "./ai/GameAI";
import { GameCollision } from "./GameCollision";

export class GameLoop {
  private bullets: BulletManager;
  private effectManager: EffectManager;
  private healthPacks: HealthPackManager;
  private ui: GameUI;
  private ai: GameAI;
  private players: Fighter[];
  private collision: GameCollision;
  private onGameOverCallback?: () => void;
  private lastTime = 0;
  private gameRunning = false;
  private gameOverTriggered = false;

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

  update(currentTime: number): void {
    if (!this.gameRunning) return;
    const deltaTime = this.lastTime ? currentTime - this.lastTime : 16;
    this.lastTime = currentTime;
    this.ui.updateTime();
    this.ai.update(deltaTime);
    this.players.forEach((p) => p.update(deltaTime));
    this.ui.updateWeaponText();
    this.bullets.update(deltaTime);
    this.effectManager.update();
    this.healthPacks.update(deltaTime);
    this.collision.clampPositions(1200, 800);
    this.bullets.checkCollisions();
    this.checkMeleeCollisions();
    this.collision.clampPositions(1200, 800);
    this.checkGameOver();
  }

  private checkMeleeCollisions(): void {
    for (const player of this.players) {
      const attack = player.getCurrentAttack();
      if (
        attack.isActive &&
        attack.data &&
        attack.data.projectile &&
        !attack.hasHit
      ) {
        this.effectManager.createShootingEffect(
          player,
          player.currentWeapon,
          attack.angle,
        );
        this.bullets.spawnBullet(player, attack.angle, attack.data);
        player.markHit();
      }
    }
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
        this.ui.showWinner();
        if (this.onGameOverCallback) {
          setTimeout(() => {
            this.onGameOverCallback?.();
            this.gameOverTriggered = false;
          }, 2000);
        }
      }
      return true;
    }
    return false;
  }

  setGameRunning(running: boolean): void {
    this.gameRunning = running;
  }
  isGameRunning(): boolean {
    return this.gameRunning;
  }
  resetTime(): void {
    this.lastTime = 0;
  }
  updatePlayersList(players: Fighter[]): void {
    this.players = players;
    this.collision.updateFighters(players);
  }
}
