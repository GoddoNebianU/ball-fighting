import { FightingGame } from "./FightingGame";

export class GameInput {
  private game: FightingGame;
  private keys: Map<string, boolean> = new Map();

  constructor(game: FightingGame) {
    this.game = game;
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.code, true);
    const humanPlayer = this.game.players.getFirstHumanPlayer();
    if (!humanPlayer) return;

    const weaponKeys: Record<string, number> = {
      KeyH: 0,
      KeyU: 1,
      KeyK: 2,
      KeyL: 3,
      KeyI: 4,
    };
    if (event.code in weaponKeys)
      humanPlayer.weaponManager.setWeaponIndex(weaponKeys[event.code]);

    const humanPlayers = this.game.players.getHumanPlayers();
    if (humanPlayers.length > 1) {
      const weaponKeys2: Record<string, number> = {
        Numpad7: 0,
        Digit7: 0,
        Numpad8: 1,
        Digit8: 1,
        Numpad9: 2,
        Digit9: 2,
        Numpad4: 3,
        Digit4: 3,
        Numpad6: 4,
        Digit6: 4,
      };
      if (event.code in weaponKeys2)
        humanPlayers[1].weaponManager.setWeaponIndex(weaponKeys2[event.code]);
    }
    this.updatePlayerInputs();
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.code, false);
    this.updatePlayerInputs();
  }

  private updatePlayerInputs(): void {
    const humanPlayers = this.game.players.getHumanPlayers();
    if (humanPlayers.length > 0) {
      const p1 = humanPlayers[0];
      p1.input.up = this.keys.get("KeyW") || false;
      p1.input.down = this.keys.get("KeyS") || false;
      p1.input.left = this.keys.get("KeyA") || false;
      p1.input.right = this.keys.get("KeyD") || false;
      p1.input.attackLight = this.keys.get("KeyJ") || false;
      p1.input.block = this.keys.get("Space") || false;
    }
    if (humanPlayers.length > 1) {
      const p2 = humanPlayers[1];
      p2.input.up =
        this.keys.get("Numpad5") || this.keys.get("Digit5") || false;
      p2.input.down =
        this.keys.get("Numpad2") || this.keys.get("Digit2") || false;
      p2.input.left =
        this.keys.get("Numpad1") || this.keys.get("Digit1") || false;
      p2.input.right =
        this.keys.get("Numpad3") || this.keys.get("Digit3") || false;
      p2.input.attackLight =
        this.keys.get("Numpad0") || this.keys.get("Digit0") || false;
      p2.input.block =
        this.keys.get("NumpadDecimal") || this.keys.get("Period") || false;
    }
  }

  clearAllInputs(): void {
    this.keys.clear();
    this.updatePlayerInputs();
  }
}
