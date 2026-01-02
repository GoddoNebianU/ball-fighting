import { Fighter } from "../fighter/Fighter";
import { AITactics } from "./AITactics";
import { AIWeaponStrategy } from "./AIWeaponStrategy";
import type { AIState } from "./types";

export class AIDecision {
  private tactics: AITactics;
  private weaponStrategy: AIWeaponStrategy;
  private previousState: AIState = "idle";

  constructor() {
    this.tactics = new AITactics("idle", 0, 150, 0.5, 0);
    this.weaponStrategy = new AIWeaponStrategy();
  }

  getState(): AIState {
    return this.tactics.getState();
  }
  setState(state: AIState): void {
    this.tactics.setState(state);
  }
  getPreviousState(): AIState {
    return this.previousState;
  }
  setPreviousState(state: AIState): void {
    this.previousState = state;
  }
  getTimer(): number {
    return this.tactics.getTimer();
  }
  setTimer(timer: number): void {
    this.tactics.setTimer(timer);
  }
  getReactionDelay(): number {
    return this.tactics.getReactionDelay();
  }
  setReactionDelay(delay: number): void {
    this.tactics.setReactionDelay(delay);
  }

  makeDecision(distance: number, ai: Fighter): void {
    this.previousState = this.tactics.getState();
    this.tactics.makeTacticalDecision(distance, ai);
  }

  decideWeapon(distance: number, ai: Fighter): number {
    return this.weaponStrategy.decideWeapon(distance, ai);
  }

  reset(): void {
    this.tactics.setState("idle");
    this.tactics.setTimer(0);
    this.tactics.setReactionDelay(500);
    this.previousState = "idle";
  }
}
