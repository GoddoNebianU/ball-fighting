import { Graphics } from "pixi.js";
import { Fighter } from "./Fighter";
import { FighterState } from "../types";
import { WeaponShapeDrawer } from "./WeaponShapeDrawer";
import { AttackEffectDrawer } from "./AttackEffectDrawer";

/** 角色武器渲染系统 */
export class FighterWeaponRenderer {
  private fighter: Fighter;
  private weaponGraphics: Graphics;

  constructor(fighter: Fighter, weaponGraphics: Graphics) {
    this.fighter = fighter;
    this.weaponGraphics = weaponGraphics;
  }

  public update(): void {
    if (
      this.fighter.state === FighterState.ATTACK &&
      this.fighter.currentAttack
    ) {
      const weaponData = this.fighter.currentWeapon.getData();

      // 只为近战武器绘制攻击效果，枪械特效由EffectManager处理
      if (!weaponData.projectile) {
        const progress =
          1 - this.fighter.combat.attackTimer / weaponData.duration;
        this.drawAttackEffect(progress);
      } else {
        // 枪械攻击不在这里绘制特效
        this.weaponGraphics.clear();
      }
    } else if (this.fighter.state === FighterState.BLOCK) {
      this.drawBlockEffect();
    } else if (
      this.fighter.state === FighterState.IDLE ||
      this.fighter.state === FighterState.WALK
    ) {
      this.drawWeapon();
    } else {
      this.weaponGraphics.clear();
    }
  }

  private drawWeapon(): void {
    WeaponShapeDrawer.drawWeapon(this.weaponGraphics, this.fighter);
  }

  private drawAttackEffect(progress: number): void {
    AttackEffectDrawer.drawAttackEffect(
      this.weaponGraphics,
      this.fighter,
      progress,
    );
  }

  private drawBlockEffect(): void {
    WeaponShapeDrawer.drawBlockEffect(this.weaponGraphics);
  }
}
