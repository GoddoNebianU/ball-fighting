/**
 * 通用配置类型
 */

export interface GameConfig {
  stageWidth: number;
  stageHeight: number;
  roundTime: number;
  maxPlayers: number;
  aiDifficulty: "easy" | "medium" | "hard";
}
