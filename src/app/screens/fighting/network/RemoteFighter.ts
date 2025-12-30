import { Container, Graphics, Text } from "pixi.js";
import type { PlayerState } from "./types";
import { RemoteFighterRenderer } from "./RemoteFighterRenderer";

export class RemoteFighter extends Container {
  public id: string;
  public name: string;
  public color: number;
  public health: number;
  public isDead: boolean;

  private targetPosition: { x: number; y: number };
  private targetRotation: number;
  private currentRotation: number = 0;

  private body!: Graphics;
  private nameText!: Text;
  private healthBar!: Graphics;
  private renderer: RemoteFighterRenderer;

  private readonly RADIUS = 25;
  private readonly LERP_FACTOR = 0.2;

  constructor(state: PlayerState) {
    super();

    this.id = state.id;
    this.name = state.name;
    this.color = state.color;
    this.health = state.health;
    this.isDead = state.isDead;

    this.x = state.position.x;
    this.y = state.position.y;

    this.targetPosition = { ...state.position };
    this.targetRotation = state.rotation;
    this.currentRotation = state.rotation;

    this.renderer = new RemoteFighterRenderer();
    this.createGraphics();
    this.updateVisuals();
  }

  syncState(state: PlayerState): void {
    this.targetPosition = { ...state.position };
    this.targetRotation = state.rotation;
    this.isDead = state.isDead;
    this.health = state.health;
  }

  updateInterpolation(): void {
    if (this.isDead) {
      this.visible = false;
      return;
    }

    const dx = this.targetPosition.x - this.x;
    const dy = this.targetPosition.y - this.y;

    this.x += dx * this.LERP_FACTOR;
    this.y += dy * this.LERP_FACTOR;

    let rotDiff = this.targetRotation - this.currentRotation;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

    this.currentRotation += rotDiff * this.LERP_FACTOR;

    this.updateVisuals();
  }

  private createGraphics(): void {
    this.body = this.renderer.createBody(this.color);
    this.addChild(this.body);

    this.nameText = this.renderer.createNameText(this.name, this.RADIUS);
    this.addChild(this.nameText);

    this.healthBar = this.renderer.createHealthBar(this.RADIUS);
    this.addChild(this.healthBar);

    this.renderer.updateHealthBar(this.healthBar, this.health, this.RADIUS);
  }

  private updateVisuals(): void {
    this.renderer.updateBody(
      this.body,
      this.color,
      this.RADIUS,
      this.currentRotation,
    );
    this.renderer.updateHealthBar(this.healthBar, this.health, this.RADIUS);
  }

  takeDamageVisual(): void {
    this.body.alpha = 0.5;
    setTimeout(() => {
      this.body.alpha = 1;
    }, 100);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getRotation(): number {
    return this.currentRotation;
  }
}
