import { Container, Graphics } from "pixi.js";
import { Fighter } from "./Fighter";
import { FighterAnimation } from "./FighterAnimation";
import { FighterWeaponRenderer } from "./FighterWeaponRenderer";
import { SpeechBubble } from "./SpeechBubble";
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
  private speechBubble: SpeechBubble;
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
    this.speechBubble = new SpeechBubble();
    this.speechBubble.setTarget(this.fighter);
    this.nameTag = new PlayerNameTag(playerName, color);
  }

  getSpeechBubble(): SpeechBubble {
    return this.speechBubble;
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
    this.bodyGraphics
      .circle(-Fighter.CONFIG.radius + 5, 0, 8)
      .fill({ color: color - 0x222222 });
    this.bodyGraphics
      .circle(Fighter.CONFIG.radius - 5, 0, 8)
      .fill({ color: color - 0x222222 });
    this.healthBarGraphics
      .roundRect(-30, -50, 60, 8, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
  }

  update(): void {
    this.animation.update();
    this.weaponRenderer.update();
    this.speechBubble.update(16);
  }

  showSpeech(message: string): void {
    this.speechBubble.show(message);
  }
}
