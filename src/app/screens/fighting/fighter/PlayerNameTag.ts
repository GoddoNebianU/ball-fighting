import { Text } from "pixi.js";

/** 角色名字标签 - 显示在角色旁边，不跟随旋转 */
export class PlayerNameTag {
  private text: Text;
  private offsetY: number = 45; // 显示在角色下方（增加到45避免与角色重合）

  constructor(playerName: string, color: number) {
    this.text = new Text({
      text: playerName,
      style: {
        fontSize: 14,
        fontWeight: "normal",
        fill: color,
      },
    });

    // 名字完全不透明，显眼
    this.text.alpha = 1.0;

    // 居中对齐
    this.text.anchor.set(0.5, 0);
    // 设置初始位置（在角色下方）
    this.text.y = this.offsetY;
  }

  /** 获取文本对象 */
  public getText(): Text {
    return this.text;
  }

  /** 更新名字 */
  public setName(name: string): void {
    this.text.text = name;
  }

  /** 设置颜色 */
  public setColor(color: number): void {
    this.text.style = {
      ...this.text.style,
      fill: color,
    };
  }
}
