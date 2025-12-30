import { Graphics } from "pixi.js";

export interface ShootingEffect {
  graphics: Graphics;
  startTime: number;
  duration: number;
  startX: number;
  startY: number;
  angle: number;
  weaponName: string;
  range: number;
}
