import { Fighter } from "../fighter/Fighter";
import { AITactics } from "./AITactics";
import { AIWeaponStrategy } from "./AIWeaponStrategy";
import type { AIState } from "./types";

/** AI决策系统 */
export class AIDecision {
  private tactics: AITactics;
  private weaponStrategy: AIWeaponStrategy;
  private previousState: AIState = "idle";

  constructor() {
    this.tactics = new AITactics("idle", 0, 150, 0.5, 0);
    this.weaponStrategy = new AIWeaponStrategy();
  }

  public getState(): AIState {
    return this.tactics.getState();
  }

  public setState(state: AIState): void {
    this.tactics.setState(state);
  }

  public getPreviousState(): AIState {
    return this.previousState;
  }

  public setPreviousState(state: AIState): void {
    this.previousState = state;
  }

  public getTimer(): number {
    return this.tactics.getTimer();
  }

  public setTimer(timer: number): void {
    this.tactics.setTimer(timer);
  }

  public getReactionDelay(): number {
    return this.tactics.getReactionDelay();
  }

  public setReactionDelay(delay: number): void {
    this.tactics.setReactionDelay(delay);
  }

  public makeDecision(distance: number, ai: Fighter): void {
    this.previousState = this.tactics.getState();
    this.tactics.makeTacticalDecision(distance, ai);
  }

  public decideWeapon(distance: number, ai: Fighter): number {
    return this.weaponStrategy.decideWeapon(distance, ai);
  }

  public reset(): void {
    this.tactics.setState("idle");
    this.tactics.setTimer(0);
    this.tactics.setReactionDelay(500);
    this.previousState = "idle";
  }
}
