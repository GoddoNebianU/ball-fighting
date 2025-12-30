import { Text } from "pixi.js";

/** UI 文本创建器 */
export class UITextFactory {
  public static createTimeText(): Text {
    return new Text({
      text: "99",
      style: { fontSize: 48, fill: 0xffffff, fontWeight: "bold" },
    });
  }

  public static createNameText(name: string, color: number): Text {
    return new Text({
      text: name,
      style: { fontSize: 24, fill: color, fontWeight: "bold" },
    });
  }

  public static createScoreText(color: number): Text {
    return new Text({
      text: "0",
      style: { fontSize: 36, fill: color, fontWeight: "bold" },
    });
  }

  public static createRoundText(): Text {
    return new Text({
      text: "ROUND 1",
      style: { fontSize: 72, fill: 0xffff00, fontWeight: "bold" },
    });
  }

  public static createWinnerText(): Text {
    return new Text({
      text: "",
      style: { fontSize: 64, fill: 0xff0000, fontWeight: "bold" },
    });
  }

  public static createControlHint(): Text {
    return new Text({
      text: "WASD: Move | J: Fist | K: Pistol | L: MG | I: Sniper | Space: Block",
      style: { fontSize: 14, fill: 0xffffff },
    });
  }

  public static createWeaponText(): Text {
    return new Text({
      text: "Pistol",
      style: { fontSize: 20, fill: 0xffffff, fontWeight: "bold" },
    });
  }

  public static createAmmoText(): Text {
    return new Text({
      text: "",
      style: { fontSize: 16, fill: 0xffff00, fontWeight: "bold" },
    });
  }
}
