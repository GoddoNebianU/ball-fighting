import { Container } from "pixi.js";
import { NetworkManager } from "./NetworkManager";
import { RemoteFighter } from "./RemoteFighter";
import { RemoteBullet } from "./RemoteBullet";
import type { GameStateUpdate, GameStartedEvent, GameOverEvent } from "./types";

export class NetworkGameEventHandler {
  private onGameStartCallback?: (data: GameStartedEvent) => void;
  private onGameOverCallback?: (data: GameOverEvent) => void;

  constructor(
    private networkManager: NetworkManager,
    private players: Map<string, RemoteFighter>,
    private remoteBullets: Map<string, RemoteBullet>,
    private container: Container,
    private localPlayerId: string | null,
  ) {}

  public setup(
    onGameStart?: (data: GameStartedEvent) => void,
    onGameOver?: (data: GameOverEvent) => void,
  ): void {
    this.onGameStartCallback = onGameStart;
    this.onGameOverCallback = onGameOver;

    this.networkManager.on("game:started", (data: unknown) => {
      if (this.onGameStartCallback) {
        this.onGameStartCallback(data as GameStartedEvent);
      }
    });

    this.networkManager.on("game:state_update", (data: unknown) => {
      this.syncGameState(data as GameStateUpdate);
    });

    this.networkManager.on("game:player_damaged", (data: unknown) => {
      this.applyDamage(
        data as {
          targetId: string;
          damage: number;
          newHealth: number;
          attackerId?: string;
        },
      );
    });

    this.networkManager.on("game:player_died", (data: unknown) => {
      this.handlePlayerDeath(data as { playerId: string; killerId?: string });
    });

    this.networkManager.on("game:over", (data: unknown) => {
      if (this.onGameOverCallback) {
        this.onGameOverCallback(data as GameOverEvent);
      }
    });

    this.networkManager.on("game:bullet_spawn", (data: unknown) => {
      this.spawnRemoteBullet(
        data as {
          bulletId: string;
          ownerId: string;
          position: { x: number; y: number };
          velocity: { x: number; y: number };
        },
      );
    });

    this.networkManager.on("game:bullet_destroy", (data: unknown) => {
      this.destroyRemoteBullet(data as { bulletId: string });
    });

    this.networkManager.on("game:health_pack_spawn", (data: unknown) => {
      this.spawnRemoteHealthPack(
        data as { packId: string; position: { x: number; y: number } },
      );
    });

    this.networkManager.on("game:health_pack_consumed", (data: unknown) => {
      this.consumeRemoteHealthPack(
        data as { packId: string; playerId: string },
      );
    });
  }

  private syncGameState(data: GameStateUpdate): void {
    console.log(
      "[NetworkGameEventHandler] 收到游戏状态更新，玩家数量:",
      Object.keys(data.players).length,
    );
    Object.entries(data.players).forEach(([playerId, state]) => {
      console.log(
        `[NetworkGameEventHandler] 玩家 ${playerId}: ${state.name}, 位置: (${state.position.x}, ${state.position.y}), isDead: ${state.isDead}`,
      );

      if (state.isDead) {
        const player = this.players.get(playerId);
        if (player) {
          player.isDead = true;
          player.visible = false;
        }
        return;
      }

      let player = this.players.get(playerId);
      if (!player) {
        player = new RemoteFighter(state);
        this.players.set(playerId, player);
        this.container.addChild(player);

        if (playerId === this.localPlayerId) {
          (
            player as RemoteFighter & { isLocalPlayer?: boolean }
          ).isLocalPlayer = true;
        }

        console.log(
          `[NetworkFightingGame] 创建玩家: ${state.name}${playerId === this.localPlayerId ? " (本地)" : " (远程)"}`,
        );
      }

      player.syncState(state);
    });
  }

  private applyDamage(data: {
    targetId: string;
    damage: number;
    newHealth: number;
    attackerId?: string;
  }): void {
    console.log("[NetworkFightingGame] 玩家受伤", data);

    const player = this.players.get(data.targetId);
    if (player) {
      player.takeDamageVisual();
      player.health = data.newHealth;
    }
  }

  private handlePlayerDeath(data: {
    playerId: string;
    killerId?: string;
  }): void {
    console.log("[NetworkFightingGame] 玩家死亡", data);

    const player = this.players.get(data.playerId);
    if (player) {
      player.isDead = true;
      player.visible = false;
    }
  }

  private spawnRemoteBullet(data: {
    bulletId: string;
    ownerId: string;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
  }): void {
    console.log("[NetworkFightingGame] 生成远程子弹", data);

    if (data.ownerId === this.localPlayerId) return;

    const bullet = new RemoteBullet({
      id: data.bulletId,
      ownerId: data.ownerId,
      position: data.position,
      velocity: data.velocity,
      damage: 10,
      knockback: 10,
      active: true,
    });
    this.remoteBullets.set(data.bulletId, bullet);
    this.container.addChild(bullet);
  }

  private destroyRemoteBullet(data: { bulletId: string }): void {
    console.log("[NetworkFightingGame] 销毁远程子弹", data.bulletId);

    const bullet = this.remoteBullets.get(data.bulletId);
    if (bullet) {
      bullet.destroy();
      this.container.removeChild(bullet);
      this.remoteBullets.delete(data.bulletId);
    }
  }

  private spawnRemoteHealthPack(data: {
    packId: string;
    position: { x: number; y: number };
  }): void {
    console.log("[NetworkFightingGame] 生成远程血包", data);
    // TODO: 创建血包渲染对象
  }

  private consumeRemoteHealthPack(data: {
    packId: string;
    playerId: string;
  }): void {
    console.log("[NetworkFightingGame] 消耗远程血包", data.packId);
    // TODO: 销毁血包渲染对象
  }
}
