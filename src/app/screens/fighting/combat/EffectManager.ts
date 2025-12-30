import { Container, Graphics } from "pixi.js";
import { Fighter } from "../fighter/Fighter";
import { Weapon } from "../weapons";
import { ShootingEffect } from "./EffectTypes";
import { WeaponEffectRenderer } from "./WeaponEffectRenderer";

export type { ShootingEffect } from "./EffectTypes";

/** 射击特效管理器 */
export class EffectManager {
  private game: Container;
  private effects: ShootingEffect[] = [];
  private renderer: WeaponEffectRenderer;

  constructor(game: Container) {
    this.game = game;
    this.renderer = new WeaponEffectRenderer();
  }

  public createShootingEffect(
    fighter: Fighter,
    weapon: Weapon,
    angle: number,
  ): void {
    const weaponName = weapon.getName();
    const weaponData = weapon.getData();

    if (
      weaponName !== "手枪" &&
      weaponName !== "机枪" &&
      weaponName !== "狙击枪"
    ) {
      return;
    }

    const graphics = new Graphics();
    this.game.addChild(graphics);

    const effect: ShootingEffect = {
      graphics,
      startTime: Date.now(),
      duration: weaponData.duration,
      startX: fighter.x,
      startY: fighter.y,
      angle,
      weaponName,
      range: weaponData.range,
    };

    this.effects.push(effect);
  }

  public update(): void {
    const currentTime = Date.now();

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      const elapsed = currentTime - effect.startTime;

      if (elapsed >= effect.duration) {
        this.game.removeChild(effect.graphics);
        effect.graphics.destroy();
        this.effects.splice(i, 1);
        continue;
      }

      this.updateEffect(effect, elapsed);
    }
  }

  private updateEffect(effect: ShootingEffect, elapsed: number): void {
    const graphics = effect.graphics;
    const progress = elapsed / effect.duration;

    graphics.clear();

    if (effect.weaponName === "手枪") {
      this.renderer.renderPistolEffect(graphics, effect, progress);
    } else if (effect.weaponName === "机枪") {
      this.renderer.renderMachineGunEffect(graphics, effect, progress);
    } else if (effect.weaponName === "狙击枪") {
      this.renderer.renderSniperEffect(graphics, effect, progress);
    }
  }

  public clear(): void {
    for (const effect of this.effects) {
      this.game.removeChild(effect.graphics);
      effect.graphics.destroy();
    }
    this.effects = [];
  }
}
