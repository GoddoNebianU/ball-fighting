import { AIDecision } from "./AIDecision";

/** AI控制器状态 */
export interface AIController {
  decision: AIDecision;
  decisionCooldown: number;
  reactionDelay: number;
  idleTimer: number;
  isIdling: boolean;
  weaponSwitchCooldown: number;
  pidAim: {
    integralX: number;
    integralY: number;
    lastErrorX: number;
    lastErrorY: number;
  };
}

/** AI 控制器工厂 */
export class AIControllerFactory {
  static create(): AIController {
    return {
      decision: new AIDecision(),
      decisionCooldown: 0,
      reactionDelay: 0,
      idleTimer: 0,
      isIdling: false,
      weaponSwitchCooldown: 0,
      pidAim: {
        integralX: 0,
        integralY: 0,
        lastErrorX: 0,
        lastErrorY: 0,
      },
    };
  }

  static reset(controller: AIController): void {
    controller.decision.reset();
    controller.decisionCooldown = 0;
    controller.reactionDelay = 500;
    controller.idleTimer = 0;
    controller.isIdling = false;
    controller.weaponSwitchCooldown = 1000;
    controller.pidAim.integralX = 0;
    controller.pidAim.integralY = 0;
    controller.pidAim.lastErrorX = 0;
    controller.pidAim.lastErrorY = 0;
  }
}
