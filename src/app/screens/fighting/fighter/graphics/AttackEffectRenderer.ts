/**
 * 攻击特效渲染器
 * 统一管理所有武器的攻击特效
 */

import { Graphics } from "pixi.js";
import { MeleeAttackEffectRenderer } from "./effects/MeleeAttackEffectRenderer";
import { PistolEffectRenderer } from "./effects/PistolEffectRenderer";
import { MachineGunEffectRenderer } from "./effects/MachineGunEffectRenderer";
import { SniperEffectRenderer } from "./effects/SniperEffectRenderer";

export class AttackEffectRenderer {
  private graphics: Graphics;
  private meleeRenderer: MeleeAttackEffectRenderer;
  private pistolRenderer: PistolEffectRenderer;
  private machineGunRenderer: MachineGunEffectRenderer;
  private sniperRenderer: SniperEffectRenderer;

  constructor() {
    this.graphics = new Graphics();
    this.meleeRenderer = new MeleeAttackEffectRenderer();
    this.pistolRenderer = new PistolEffectRenderer();
    this.machineGunRenderer = new MachineGunEffectRenderer();
    this.sniperRenderer = new SniperEffectRenderer();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public drawAttackEffect(
    weaponName: string,
    progress: number,
    radius: number,
    range: number,
  ): void {
    this.graphics.clear();

    // 攻击始终向右(Fighter 容器的前方),因为容器已经旋转了
    const attackDist = radius + Math.sin(progress * Math.PI) * range;

    if (weaponName === "轻拳") {
      this.meleeRenderer.drawLightPunch(this.graphics, attackDist, 0);
    } else if (weaponName === "重拳") {
      this.meleeRenderer.drawHeavyPunch(this.graphics, progress, attackDist);
    } else if (weaponName === "手枪") {
      this.pistolRenderer.drawEffect(this.graphics, radius, range, progress);
    } else if (weaponName === "机枪") {
      this.machineGunRenderer.drawEffect(
        this.graphics,
        radius,
        range,
        progress,
      );
    } else if (weaponName === "狙击枪") {
      this.sniperRenderer.drawEffect(this.graphics, radius, range, progress);
    }
  }
}
