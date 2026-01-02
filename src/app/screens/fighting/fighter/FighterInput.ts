import { FighterCombat } from "./FighterCombat";

export class FighterInput {
  input = {
    up: false,
    down: false,
    left: false,
    right: false,
    attackLight: false,
    attackHeavy: false,
    block: false,
  };

  constructor(private combat: FighterCombat) {}

  updateAttackDirection(): { dx: number; dy: number } {
    let dx = 0,
      dy = 0;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;
    if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };
    const len = Math.sqrt(dx * dx + dy * dy);
    this.combat.attackAngle = Math.atan2(dy, dx);
    return { dx: dx / len, dy: dy / len };
  }

  hasMovementInput(): boolean {
    return (
      this.input.up || this.input.down || this.input.left || this.input.right
    );
  }
}
