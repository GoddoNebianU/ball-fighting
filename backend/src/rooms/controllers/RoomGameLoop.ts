/**
 * 房间游戏循环
 * 处理游戏更新、碰撞检测、子弹和血包更新
 */

import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { BulletState, PlayerDiedEvent } from "../../types";
import { RoomPlayerManager } from "../managers/RoomPlayerManager";
import { RoomGameLoop } from "../managers/RoomGameLoop";
import { RoomCombat } from "../managers/RoomCombat";
import { AIDecision } from "../../shared/ai/AIDecision";

export class RoomUpdateLoop {
  private gameInterval: NodeJS.Timeout | null = null;
  private stateUpdateInterval: NodeJS.Timeout | null = null;

  constructor(
    private roomId: string,
    private io: Server,
    private playerManager: RoomPlayerManager,
    private gameLoopManager: RoomGameLoop,
    private combat: RoomCombat,
    private onGameOver: () => void,
  ) {}

  public start(onUpdate: () => void, onStateUpdate: () => void): void {
    let lastTime = Date.now();

    this.gameInterval = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      this.update(deltaTime);
      this.checkGameOver();
      onUpdate();
    }, 1000 / 60); // 60 FPS

    this.stateUpdateInterval = setInterval(() => {
      onStateUpdate();
    }, 50); // 20 Hz
  }

  public stop(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    if (this.stateUpdateInterval) {
      clearInterval(this.stateUpdateInterval);
      this.stateUpdateInterval = null;
    }
  }

  private update(deltaTime: number): void {
    const players = this.playerManager.getAllPlayers();

    // 更新 AI 输入（在移动之前）
    this.updateAIInput(players);

    // 更新玩家移动
    players.forEach((player) => {
      this.gameLoopManager.updatePlayerMovement(player, deltaTime);
      this.gameLoopManager.updatePlayerAttack(player, Date.now(), (bullet) => {
        const bulletState: BulletState = {
          id: `bullet_${uuidv4()}`,
          ownerId: bullet.ownerId,
          position: { x: bullet.x, y: bullet.y },
          velocity: {
            x: Math.cos(bullet.rotation) * bullet.speed,
            y: Math.sin(bullet.rotation) * bullet.speed,
          },
          damage: bullet.damage,
          knockback: 10,
          active: true,
        };
        this.combat.spawnBullet(bulletState);
        this.io.to(this.roomId).emit("game:bullet_spawn", bulletState);
      });
    });

    // 更新子弹
    this.combat.updateBullets(
      deltaTime,
      (bulletId, targetId, damage) => {
        this.handlePlayerDamage(bulletId, targetId, damage);
      },
      (bulletId) => {
        this.io.to(this.roomId).emit("game:bullet_destroy", { bulletId });
      },
    );

    // 检查子弹碰撞
    this.combat.getBullets().forEach((bullet) => {
      this.combat.checkBulletCollision(
        bullet.id,
        players,
        (bulletId, targetId, damage) => {
          this.handlePlayerDamage(bulletId, targetId, damage);
        },
      );
    });

    // 更新血包
    this.combat.updateHealthPacks(
      Date.now(),
      deltaTime,
      (pack) => {
        this.io.to(this.roomId).emit("game:health_pack_spawn", pack);
      },
      (packId, playerId, healAmount) => {
        this.handleHealthPackConsume(packId, playerId, healAmount);
      },
    );

    // 检查血包碰撞
    this.combat.checkHealthPackCollision(
      players,
      (packId, playerId, healAmount) => {
        this.handleHealthPackConsume(packId, playerId, healAmount);
      },
    );
  }

  private handlePlayerDamage(
    bulletId: string,
    targetId: string,
    damage: number,
  ): void {
    const player = this.playerManager.getPlayer(targetId);
    if (player && !player.isDead) {
      const newHealth = Math.max(0, player.health - damage);
      this.playerManager.damagePlayer(targetId, damage, newHealth);

      this.io.to(this.roomId).emit("game:player_damaged", {
        targetId,
        damage,
        newHealth,
      });

      if (newHealth <= 0) {
        const diedEvent: PlayerDiedEvent = {
          roomId: this.roomId,
          playerId: targetId,
          killerId: this.combat.getBullet(bulletId)?.ownerId || "",
        };
        this.io.to(this.roomId).emit("game:player_died", diedEvent);
      }
    }
  }

  private handleHealthPackConsume(
    packId: string,
    playerId: string,
    healAmount: number,
  ): void {
    const player = this.playerManager.getPlayer(playerId);
    if (player) {
      player.health = Math.min(200, player.health + healAmount);
      this.io.to(this.roomId).emit("game:health_pack_consumed", {
        packId,
        playerId,
        healAmount,
        newHealth: player.health,
      });
    }
  }

  private checkGameOver(): void {
    const alivePlayers = this.playerManager.getAlivePlayers();

    // 只剩一个玩家存活，游戏结束
    if (alivePlayers.length <= 1 && this.playerManager.getSize() > 1) {
      this.onGameOver();
    }
  }

  private updateAIInput(
    players: import("../managers/RoomPlayerManager").RoomPlayer[],
  ): void {
    players.forEach((ai) => {
      if (!ai.config.isAI || ai.isDead) return;

      // 转换为共享的 PlayerState 格式
      const aiState = {
        id: ai.id,
        name: ai.config.name,
        color: ai.config.color,
        position: { x: ai.x, y: ai.y },
        rotation: ai.rotation,
        health: ai.health,
        maxHealth: 200,
        currentWeapon: "",
        isDead: ai.isDead,
        state: "idle" as const,
      };

      const allPlayers = players.map((p) => ({
        id: p.id,
        name: p.config.name,
        color: p.config.color,
        position: { x: p.x, y: p.y },
        rotation: p.rotation,
        health: p.health,
        maxHealth: 200,
        currentWeapon: "",
        isDead: p.isDead,
        state: "idle" as const,
      }));

      // 使用共享的 AI 决策逻辑
      const input = AIDecision.generateAIInput(aiState, allPlayers);

      // 更新 AI 输入
      ai.input.up = input.up;
      ai.input.down = input.down;
      ai.input.left = input.left;
      ai.input.right = input.right;
      ai.input.attack = input.attack;
      ai.input.block = input.block;
    });
  }
}
