/**
 * 大厅输入处理器
 * 处理键盘输入、房间配置输入
 */

export class LobbyInputHandler {
  public roomNameInput: string = "";
  public maxPlayersSelection: number = 6;
  public roomPasswordInput: string = "";
  public passwordEnabled: boolean = false;
  public inputMode: "none" | "name" | "password" | "joinPassword" = "none";
  public inputPrompt: string = "";
  public inputValue: string = "";

  public handleKeyDown(key: string): void {
    if (this.inputMode === "none") return;

    if (key === "Enter") {
      this.confirmInput();
    } else if (key === "Escape") {
      this.cancelInput();
    } else if (key === "Backspace" || key === "Delete") {
      this.inputValue = this.inputValue.slice(0, -1);
    } else if (key.length === 1 && this.inputValue.length < 20) {
      // 允许字母、数字和中文
      this.inputValue += key;
    }
  }

  private confirmInput(): void {
    if (this.inputMode === "name") {
      this.roomNameInput = this.inputValue;
      this.inputMode = "none";
      this.inputValue = "";
    } else if (
      this.inputMode === "password" ||
      this.inputMode === "joinPassword"
    ) {
      this.roomPasswordInput = this.inputValue;
      this.inputMode = "none";
      this.inputValue = "";
    }
  }

  private cancelInput(): void {
    this.inputMode = "none";
    this.inputValue = "";
  }

  public startNameInput(): void {
    this.inputMode = "name";
    this.inputPrompt = "输入房间名称:";
    this.inputValue = this.roomNameInput;
  }

  public startPasswordInput(): void {
    this.inputMode = "password";
    this.inputPrompt = "输入房间密码:";
    this.inputValue = this.roomPasswordInput;
  }

  public startJoinPasswordInput(): void {
    this.inputMode = "joinPassword";
    this.inputPrompt = "输入房间密码:";
    this.inputValue = "";
  }

  public togglePassword(): void {
    this.passwordEnabled = !this.passwordEnabled;
    if (!this.passwordEnabled) {
      this.roomPasswordInput = "";
    }
  }

  public changeMaxPlayers(delta: number): void {
    this.maxPlayersSelection = Math.max(
      2,
      Math.min(10, this.maxPlayersSelection + delta),
    );
  }
}
