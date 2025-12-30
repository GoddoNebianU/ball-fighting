import { FighterCombat } from "./FighterCombat";

/** Fighter输入处理 */
export class FighterInput {
  public input = {
    up: false,
    down: false,
    left: false,
    right: false,
    attackLight: false,
    attackHeavy: false,
    block: false,
  };

  constructor(private combat: FighterCombat) {}

  public updateAttackDirection(): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;

    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      this.combat.attackAngle = Math.atan2(dy, dx);
      return { dx, dy };
    }

    return { dx: 0, dy: 0 };
  }

  public hasMovementInput(): boolean {
    return (
      this.input.up || this.input.down || this.input.left || this.input.right
    );
  }
}
