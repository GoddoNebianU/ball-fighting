/** 网络游戏输入处理器 */

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  block: boolean;
}

export class NetworkInputHandler {
  private input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    block: false,
  };

  private onKeyDownCallback?: (input: InputState) => void;
  private onKeyUpCallback?: (input: InputState) => void;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  public setup(
    onKeyDown?: (input: InputState) => void,
    onKeyUp?: (input: InputState) => void,
  ): void {
    this.onKeyDownCallback = onKeyDown;
    this.onKeyUpCallback = onKeyUp;

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  public cleanup(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  public getInput(): Readonly<InputState> {
    return this.input;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    let changed = false;

    switch (e.code) {
      case "KeyW":
        this.input.up = true;
        changed = true;
        break;
      case "KeyS":
        this.input.down = true;
        changed = true;
        break;
      case "KeyA":
        this.input.left = true;
        changed = true;
        break;
      case "KeyD":
        this.input.right = true;
        changed = true;
        break;
      case "Space":
        this.input.block = true;
        changed = true;
        break;
      case "KeyJ":
        this.input.attack = true;
        changed = true;
        break;
    }

    if (changed && this.onKeyDownCallback) {
      this.onKeyDownCallback(this.input);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    let changed = false;

    switch (e.code) {
      case "KeyW":
        this.input.up = false;
        changed = true;
        break;
      case "KeyS":
        this.input.down = false;
        changed = true;
        break;
      case "KeyA":
        this.input.left = false;
        changed = true;
        break;
      case "KeyD":
        this.input.right = false;
        changed = true;
        break;
      case "Space":
        this.input.block = false;
        changed = true;
        break;
      case "KeyJ":
        this.input.attack = false;
        changed = true;
        break;
    }

    if (changed && this.onKeyUpCallback) {
      this.onKeyUpCallback(this.input);
    }
  }
}
