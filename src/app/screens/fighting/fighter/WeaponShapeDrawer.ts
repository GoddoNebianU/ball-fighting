import { Graphics } from "pixi.js";
import { Fighter } from "./Fighter";

/** 武器形状绘制器 */
export class WeaponShapeDrawer {
  static drawWeapon(weaponGraphics: Graphics, fighter: Fighter): void {
    weaponGraphics.clear();

    // 武器放在角色右侧（因为角色会旋转）
    const weaponDist = Fighter.CONFIG.radius - 5;
    const weaponX = weaponDist;
    const weaponY = 0;

    const weaponName = fighter.currentWeapon.getName();

    if (weaponName === "手枪") {
      // 手枪: 黑色枪身
      weaponGraphics
        .roundRect(weaponX - 3, weaponY - 8, 6, 16, 2)
        .fill({ color: 0x333333 });
      weaponGraphics.circle(weaponX, weaponY - 5, 3).fill({ color: 0x444444 });
    } else if (weaponName === "机枪") {
      // 机枪: 更长更大的枪身,深灰色
      weaponGraphics
        .roundRect(weaponX - 4, weaponY - 10, 8, 22, 2)
        .fill({ color: 0x2a2a2a });
      weaponGraphics
        .roundRect(weaponX - 2, weaponY - 8, 4, 12, 1)
        .fill({ color: 0x1a1a1a });
      // 弹匣
      weaponGraphics
        .roundRect(weaponX - 3, weaponY + 5, 6, 8, 1)
        .fill({ color: 0x3a3a3a });
    } else if (weaponName === "狙击枪") {
      // 狙击枪: 超长的枪管,战术风格
      // 主枪身 - 深绿色
      weaponGraphics
        .roundRect(weaponX - 5, weaponY - 12, 10, 28, 2)
        .fill({ color: 0x1a2a1a });

      // 枪管 - 更长更细
      weaponGraphics
        .roundRect(weaponX - 2, weaponY - 25, 4, 15, 1)
        .fill({ color: 0x0f1a0f });

      // 瞄准镜 - 粗壮的瞄准镜座
      weaponGraphics
        .roundRect(weaponX - 6, weaponY - 18, 12, 4, 1)
        .fill({ color: 0x2a3a2a });

      // 瞄准镜主体
      weaponGraphics
        .roundRect(weaponX - 4, weaponY - 22, 8, 6, 2)
        .fill({ color: 0x3a4a3a });

      // 瞄准镜镜头
      weaponGraphics
        .circle(weaponX, weaponY - 20, 2)
        .fill({ color: 0x00ffff, alpha: 0.8 });

      // 枪托
      weaponGraphics
        .roundRect(weaponX - 4, weaponY + 8, 8, 10, 2)
        .fill({ color: 0x2a3a2a });

      // 弹匣 - 狙击枪的单发弹匣很小
      weaponGraphics
        .roundRect(weaponX - 2, weaponY + 10, 4, 4, 1)
        .fill({ color: 0x1a2a1a });

      // 战术细节 - 枪身上的纹路
      weaponGraphics
        .rect(weaponX - 3, weaponY - 8, 6, 12)
        .stroke({ width: 1, color: 0x0f1a0f, alpha: 0.5 });
    } else if (weaponName === "重拳") {
      // 重拳: 红色光晕
      weaponGraphics
        .circle(weaponX, weaponY, 12)
        .fill({ color: 0xff0000, alpha: 0.3 });
    }
    // 轻拳不显示武器
  }

  static drawBlockEffect(weaponGraphics: Graphics): void {
    weaponGraphics.clear();
    weaponGraphics
      .circle(0, 0, Fighter.CONFIG.radius + 10)
      .stroke({ width: 4, color: 0x00ffff, alpha: 0.7 });
    weaponGraphics
      .circle(0, 0, Fighter.CONFIG.radius + 5)
      .fill({ color: 0x00ffff, alpha: 0.1 });
  }
}
