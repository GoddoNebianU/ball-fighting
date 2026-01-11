import { Container, Graphics } from "pixi.js";
import { Fighter } from "./Fighter";
import { FighterAnimation } from "./FighterAnimation";
import { FighterWeaponRenderer } from "./FighterWeaponRenderer";
import { PlayerNameTag } from "./PlayerNameTag";

export class FighterGraphics {
  private fighter: Fighter;
  readonly container: Container;
  private bodyGraphics: Graphics;
  private weaponGraphics: Graphics;
  private shadowGraphics: Graphics;
  private healthBarGraphics: Graphics;
  private animation: FighterAnimation;
  private weaponRenderer: FighterWeaponRenderer;
  private nameTag: PlayerNameTag;

  constructor(fighter: Fighter, color: number, playerName: string) {
    this.fighter = fighter;
    this.container = new Container();
    this.bodyGraphics = new Graphics();
    this.weaponGraphics = new Graphics();
    this.shadowGraphics = new Graphics();
    this.healthBarGraphics = new Graphics();
    this.initCharacter(color);
    this.container.addChild(
      this.shadowGraphics,
      this.bodyGraphics,
      this.weaponGraphics,
      this.healthBarGraphics,
    );
    this.animation = new FighterAnimation(
      this.fighter,
      this.bodyGraphics,
      this.healthBarGraphics,
    );
    this.weaponRenderer = new FighterWeaponRenderer(
      this.fighter,
      this.weaponGraphics,
    );
    this.nameTag = new PlayerNameTag(playerName, color);
  }

  getNameTag(): PlayerNameTag {
    return this.nameTag;
  }

  private initCharacter(color: number): void {
    this.shadowGraphics
      .circle(0, 0, Fighter.CONFIG.radius)
      .fill({ color: 0x000000, alpha: 0.2 });
    this.bodyGraphics.circle(0, 0, Fighter.CONFIG.radius).fill({ color });
    this.bodyGraphics
      .circle(0, 0, Fighter.CONFIG.radius - 3)
      .stroke({ width: 2, color: 0x000000, alpha: 0.3 });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius / 2, 0, 5)
      .fill({ color: 0x000000 });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius / 2 - 3, -3, 3)
      .fill({ color: 0xffffff });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius / 2 - 3, 3, 3)
      .fill({ color: 0xffffff });

    // 计算暗色版本（更安全的方法）
    const darkerColor = this.getDarkerColor(color);

    this.bodyGraphics
      .circle(-Fighter.CONFIG.radius + 5, 0, 8)
      .fill({ color: darkerColor });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius - 5, 0, 8)
      .fill({ color: darkerColor });
    this.healthBarGraphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
  }

  /**
   * 生成颜色的暗色版本（安全的 RGB 分量操作）
   */
  private getDarkerColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // 每个分量减少约 13%（32/256）
    const darkerR = Math.max(0, r - 32);
    const darkerG = Math.max(0, g - 32);
    const darkerB = Math.max(0, b - 32);

    return (darkerR << 16) | (darkerG << 8) | darkerB;
  }

  update(): void {
    this.animation.update();
    this.weaponRenderer.update();
  }
}
