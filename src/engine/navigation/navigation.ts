import { Container } from "pixi.js";

import type { CreationEngine } from "../engine";
import { ScreenManager, AppScreenConstructor } from "./ScreenManager";

export class Navigation {
  /** Reference to the main application */
  public app!: CreationEngine;

  /** Container for screens */
  public container = new Container();

  /** Application width */
  public width = 0;

  /** Application height */
  public height = 0;

  private screenManager: ScreenManager;

  constructor() {
    this.screenManager = new ScreenManager(this.app, this.container);
  }

  public init(app: CreationEngine): void {
    this.app = app;
    // 更新 screenManager 的 app 引用
    this.screenManager.setApp(app);
  }

  /** Set the default load screen */
  public setBackground(ctor: AppScreenConstructor): void {
    this.screenManager.setBackground(ctor);
  }

  /**
   * Hide current screen (if there is one) and present a new screen.
   * Any class that matches AppScreen interface can be used here.
   */
  public async showScreen(ctor: AppScreenConstructor): Promise<void> {
    return this.screenManager.showScreen(ctor);
  }

  /**
   * Show up a popup over current screen
   */
  public async presentPopup(ctor: AppScreenConstructor): Promise<void> {
    return this.screenManager.presentPopup(ctor);
  }

  /**
   * Dismiss current popup, if there is one
   */
  public async dismissPopup(): Promise<void> {
    return this.screenManager.dismissPopup();
  }

  /**
   * Resize screens
   * @param width Viewport width
   * @param height Viewport height
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.screenManager.resize(width, height);
  }

  /**
   * Blur screens when lose focus
   */
  public blur(): void {
    this.screenManager.blur();
  }

  /**
   * Focus screens
   */
  public focus(): void {
    this.screenManager.focus();
  }

  /** 获取当前屏幕 */
  public get currentScreen() {
    return this.screenManager.getCurrentScreen();
  }

  /** 获取当前弹窗 */
  public get currentPopup() {
    return this.screenManager.getCurrentPopup();
  }
}
