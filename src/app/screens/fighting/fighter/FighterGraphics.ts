import { Container, Graphics } from "pixi.js";

import { Fighter } from "./Fighter";
import { FighterState } from "../types";
import { BodyRenderer } from "./graphics/BodyRenderer";
import { HealthBarRenderer } from "./graphics/HealthBarRenderer";
import { WeaponRenderer } from "./graphics/WeaponRenderer";
import { AttackEffectRenderer } from "./graphics/AttackEffectRenderer";

/** 渲染系统 */
export class FighterGraphics {
  private fighter: Fighter;
  public readonly container: Container;

  private bodyRenderer: BodyRenderer;
  private weaponRenderer: WeaponRenderer;
  private shadowGraphics: Graphics;
  private healthBarRenderer: HealthBarRenderer;
  private attackEffectRenderer: AttackEffectRenderer;

  constructor(fighter: Fighter, color: number) {
    this.fighter = fighter;

    this.container = new Container();

    // 阴影（简单的 Graphics）
    this.shadowGraphics = this.createShadow();

    // 渲染器
    this.bodyRenderer = new BodyRenderer();
    this.weaponRenderer = new WeaponRenderer();
    this.healthBarRenderer = new HealthBarRenderer();
    this.attackEffectRenderer = new AttackEffectRenderer();

    // 初始化
    this.initCharacter(color);
    this.container.addChild(
      this.shadowGraphics,
      this.bodyRenderer.getGraphics(),
      this.weaponRenderer.getGraphics(),
      this.healthBarRenderer.getGraphics(),
    );
  }

  private createShadow(): Graphics {
    const shadow = new Graphics();
    shadow
      .circle(0, 0, Fighter.CONFIG.radius)
      .fill({ color: 0x000000, alpha: 0.2 });
    return shadow;
  }

  private initCharacter(color: number): void {
    this.bodyRenderer.initCharacter(color, Fighter.CONFIG.radius);
    this.healthBarRenderer.initBackground();
  }

  public update(): void {
    this.healthBarRenderer.update(
      this.fighter.health,
      Fighter.CONFIG.maxHealth,
    );
    this.bodyRenderer.updateAnimation(this.fighter.state);
    this.updateWeaponEffect();
  }

  private updateWeaponEffect(): void {
    // 安全检查：确保武器存在
    if (!this.fighter.currentWeapon) {
      this.weaponRenderer.getGraphics().clear();
      return;
    }

    if (
      this.fighter.state === FighterState.ATTACK &&
      this.fighter.currentAttack
    ) {
      const weaponData = this.fighter.currentWeapon.getData();

      // 只为近战武器绘制攻击效果，枪械特效由 EffectManager 处理
      if (!weaponData.projectile) {
        const progress =
          1 - this.fighter.combat.attackTimer / weaponData.duration;
        const weaponName = this.fighter.currentWeapon.getName();
        this.attackEffectRenderer.drawAttackEffect(
          weaponName,
          progress,
          Fighter.CONFIG.radius,
          weaponData.range,
        );
        this.container.addChild(this.attackEffectRenderer.getGraphics());
      } else {
        // 枪械攻击不在这里绘制特效
        this.weaponRenderer.getGraphics().clear();
      }
    } else if (this.fighter.state === FighterState.BLOCK) {
      // 清理攻击特效
      this.attackEffectRenderer.getGraphics().clear();
      if (
        this.container.children.includes(
          this.attackEffectRenderer.getGraphics(),
        )
      ) {
        this.container.removeChild(this.attackEffectRenderer.getGraphics());
      }
      this.weaponRenderer.drawBlockEffect(Fighter.CONFIG.radius);
    } else if (
      this.fighter.state === FighterState.IDLE ||
      this.fighter.state === FighterState.WALK
    ) {
      // 清理攻击特效
      this.attackEffectRenderer.getGraphics().clear();
      if (
        this.container.children.includes(
          this.attackEffectRenderer.getGraphics(),
        )
      ) {
        this.container.removeChild(this.attackEffectRenderer.getGraphics());
      }
      const weaponName = this.fighter.currentWeapon.getName();
      this.weaponRenderer.drawWeapon(weaponName, Fighter.CONFIG.radius);
    } else {
      // 清理攻击特效
      this.attackEffectRenderer.getGraphics().clear();
      if (
        this.container.children.includes(
          this.attackEffectRenderer.getGraphics(),
        )
      ) {
        this.container.removeChild(this.attackEffectRenderer.getGraphics());
      }
      this.weaponRenderer.getGraphics().clear();
    }
  }
}
