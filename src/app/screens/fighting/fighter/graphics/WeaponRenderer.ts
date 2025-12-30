import { Graphics } from "pixi.js";

/** 武器渲染器 */
export class WeaponRenderer {
  private graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  public getGraphics(): Graphics {
    return this.graphics;
  }

  public drawWeapon(weaponName: string, radius: number): void {
    this.graphics.clear();

    // 武器放在角色右侧（因为角色会旋转）
    const weaponDist = radius - 5;
    const weaponX = weaponDist;
    const weaponY = 0;

    if (weaponName === "手枪") {
      // 手枪: 黑色枪身
      this.graphics
        .roundRect(weaponX - 3, weaponY - 8, 6, 16, 2)
        .fill({ color: 0x333333 });
      this.graphics.circle(weaponX, weaponY - 5, 3).fill({ color: 0x444444 });
    } else if (weaponName === "机枪") {
      // 机枪: 更长更大的枪身,深灰色
      this.graphics
        .roundRect(weaponX - 4, weaponY - 10, 8, 22, 2)
        .fill({ color: 0x2a2a2a });
      this.graphics
        .roundRect(weaponX - 2, weaponY - 8, 4, 12, 1)
        .fill({ color: 0x1a1a1a });
      // 弹匣
      this.graphics
        .roundRect(weaponX - 3, weaponY + 5, 6, 8, 1)
        .fill({ color: 0x3a3a3a });
    } else if (weaponName === "狙击枪") {
      // 狙击枪: 超长的枪管,战术风格
      // 主枪身 - 深绿色
      this.graphics
        .roundRect(weaponX - 5, weaponY - 12, 10, 28, 2)
        .fill({ color: 0x1a2a1a });

      // 枪管 - 更长更细
      this.graphics
        .roundRect(weaponX - 2, weaponY - 25, 4, 15, 1)
        .fill({ color: 0x0f1a0f });

      // 瞄准镜 - 粗壮的瞄准镜座
      this.graphics
        .roundRect(weaponX - 6, weaponY - 18, 12, 4, 1)
        .fill({ color: 0x2a3a2a });

      // 瞄准镜主体
      this.graphics
        .roundRect(weaponX - 4, weaponY - 22, 8, 6, 2)
        .fill({ color: 0x3a4a3a });

      // 瞄准镜镜头
      this.graphics
        .circle(weaponX, weaponY - 20, 2)
        .fill({ color: 0x00ffff, alpha: 0.8 });

      // 枪托
      this.graphics
        .roundRect(weaponX - 4, weaponY + 8, 8, 10, 2)
        .fill({ color: 0x2a3a2a });

      // 弹匣 - 狙击枪的单发弹匣很小
      this.graphics
        .roundRect(weaponX - 2, weaponY + 10, 4, 4, 1)
        .fill({ color: 0x1a2a1a });

      // 战术细节 - 枪身上的纹路
      this.graphics
        .rect(weaponX - 3, weaponY - 8, 6, 12)
        .stroke({ width: 1, color: 0x0f1a0f, alpha: 0.5 });
    }
    // 轻拳和重拳不显示武器（graphics 保持清空状态）
  }

  public drawBlockEffect(radius: number): void {
    this.graphics.clear();
    this.graphics
      .circle(0, 0, radius + 10)
      .stroke({ width: 4, color: 0x00ffff, alpha: 0.7 });
    this.graphics
      .circle(0, 0, radius + 5)
      .fill({ color: 0x00ffff, alpha: 0.1 });
  }
}
