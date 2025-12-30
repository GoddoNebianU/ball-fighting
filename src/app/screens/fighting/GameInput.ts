import { FightingGame } from "./FightingGame";

/** 输入处理 */
export class GameInput {
  private game: FightingGame;
  private keys: Map<string, boolean> = new Map();

  constructor(game: FightingGame) {
    this.game = game;
    this.initInput();
  }

  private initInput(): void {
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.code, true);

    // 获取第一个人类玩家
    const humanPlayer = this.game.players.getFirstHumanPlayer();
    if (!humanPlayer) return;

    // H键: 切换到轻拳
    // U键: 切换到重拳
    // K键: 切换到手枪
    // L键: 切换到机枪
    // I键: 切换到狙击枪
    if (event.code === "KeyH") {
      // 按H键切到轻拳 - 切换到索引0(轻拳)
      console.log("[GameInput] KeyH pressed - switching to punch light");
      humanPlayer.weaponManager.setWeaponIndex(0);
    } else if (event.code === "KeyU") {
      // 按U键切到重拳 - 切换到索引1(重拳)
      console.log("[GameInput] KeyU pressed - switching to punch heavy");
      humanPlayer.weaponManager.setWeaponIndex(1);
    } else if (event.code === "KeyK") {
      // 按K键射手枪 - 切换到索引2(手枪)
      console.log("[GameInput] KeyK pressed - switching to pistol");
      humanPlayer.weaponManager.setWeaponIndex(2);
    } else if (event.code === "KeyL") {
      // 按L键射机枪 - 切换到索引3(机枪)
      console.log("[GameInput] KeyL pressed - switching to machine gun");
      humanPlayer.weaponManager.setWeaponIndex(3);
    } else if (event.code === "KeyI") {
      // 按I键切换到狙击枪 - 切换到索引4(狙击枪)
      console.log("[GameInput] KeyI pressed - switching to sniper");
      humanPlayer.weaponManager.setWeaponIndex(4);
    }

    // 玩家二的武器切换(如果有第二个人类玩家)
    const humanPlayers = this.game.players.getHumanPlayers();
    if (humanPlayers.length > 1) {
      const player2 = humanPlayers[1];
      // 7: 轻拳, 8: 重拳, 9: 手枪, 4: 机枪, 6: 狙击枪
      if (event.code === "Numpad7" || event.code === "Digit7") {
        console.log(
          "[GameInput] Player2 Key7 pressed - switching to punch light",
        );
        player2.weaponManager.setWeaponIndex(0);
      } else if (event.code === "Numpad8" || event.code === "Digit8") {
        console.log(
          "[GameInput] Player2 Key8 pressed - switching to punch heavy",
        );
        player2.weaponManager.setWeaponIndex(1);
      } else if (event.code === "Numpad9" || event.code === "Digit9") {
        console.log("[GameInput] Player2 Key9 pressed - switching to pistol");
        player2.weaponManager.setWeaponIndex(2);
      } else if (event.code === "Numpad4" || event.code === "Digit4") {
        console.log(
          "[GameInput] Player2 Key4 pressed - switching to machine gun",
        );
        player2.weaponManager.setWeaponIndex(3);
      } else if (event.code === "Numpad6" || event.code === "Digit6") {
        console.log("[GameInput] Player2 Key6 pressed - switching to sniper");
        player2.weaponManager.setWeaponIndex(4);
      }
    }

    this.updatePlayerInputs();
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.code, false);
    this.updatePlayerInputs();
  }

  private updatePlayerInputs(): void {
    const humanPlayers = this.game.players.getHumanPlayers();

    // 为第一个人类玩家更新输入(WASD + J + Space)
    if (humanPlayers.length > 0) {
      const p1 = humanPlayers[0];
      p1.input.up = this.keys.get("KeyW") || false;
      p1.input.down = this.keys.get("KeyS") || false;
      p1.input.left = this.keys.get("KeyA") || false;
      p1.input.right = this.keys.get("KeyD") || false;
      p1.input.attackLight = this.keys.get("KeyJ") || false;
      p1.input.block = this.keys.get("Space") || false;
    }

    // 如果有第二个人类玩家,使用数字键
    // 0: 攻击, .: 格挡, 5213: 上下左右, 7: 轻拳, 8: 重拳, 9: 手枪, 4: 机枪, 6: 狙击枪
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

  public clearAllInputs(): void {
    this.keys.clear();
    this.updatePlayerInputs();
  }
}
