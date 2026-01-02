import * as fs from 'fs';
import * as path from 'path';

/** 风格配置 */
export interface StyleConfig {
  name: string;
  description: string;
  systemPrompt: string;
  style: string;
  templates: string[];
}

/** 角色配置 */
export interface CharacterConfig {
  name: string;
  series: string;
  personality: string;
  color: number;
  startX: number;
  startY: number;
  messageLength?: number; // 对话长度（字符数），默认 50
  style?: StyleConfig; // 角色的专属风格配置
}

/** 风格敌人配置 */
export interface StyleEnemiesConfig {
  name: string;
  description: string;
  characters: CharacterConfig[];
}

/** 敌人配置管理服务 */
export class EnemyConfigService {
  private config: Record<string, StyleEnemiesConfig> | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(__dirname, 'enemies.json');
    this.loadConfig();
  }

  /** 加载敌人配置 */
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(content);
        const config = this.config || {};
        console.log(`[敌人配置] 已加载 ${Object.keys(config).length} 个风格的敌人配置`);
      } else {
        console.warn('[敌人配置] 配置文件不存在，使用默认配置');
        this.config = this.getDefaultConfig();
      }
    } catch (error) {
      console.error('[敌人配置] 加载配置失败:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /** 获取默认配置 */
  private getDefaultConfig(): Record<string, StyleEnemiesConfig> {
    return {
      default: {
        name: '默认风格',
        description: '标准的格斗游戏AI对话风格',
        characters: [
          {
            name: '孙悟空',
            series: '七龙珠',
            personality: '热血、自信、好战',
            color: 0xff8800,
            startX: -250,
            startY: -150,
          },
        ],
      },
    };
  }

  /** 重新加载配置 */
  reloadConfig(): void {
    this.loadConfig();
  }

  /** 获取指定风格的敌人配置 */
  getStyleEnemies(styleName: string): StyleEnemiesConfig | null {
    if (!this.config) return null;
    return this.config[styleName] || null;
  }

  /** 获取指定风格的角色列表 */
  getStyleCharacters(styleName: string): CharacterConfig[] {
    const styleConfig = this.getStyleEnemies(styleName);
    return styleConfig ? styleConfig.characters : [];
  }

  /** 获取所有风格列表 */
  getAllStyles(): { style: string; name: string; characterCount: number }[] {
    if (!this.config) return [];
    return Object.entries(this.config || {}).map(([style, config]) => ({
      style,
      name: config.name,
      characterCount: config.characters.length,
    }));
  }

  /** 保存敌人配置 */
  saveConfig(config: Record<string, StyleEnemiesConfig>): boolean {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      this.config = config;
      console.log('[敌人配置] 配置已保存');
      return true;
    } catch (error) {
      console.error('[敌人配置] 保存配置失败:', error);
      return false;
    }
  }

  /** 添加新风格 */
  addStyle(styleName: string, styleConfig: StyleEnemiesConfig): boolean {
    if (!this.config) return false;
    this.config[styleName] = styleConfig;
    return this.saveConfig(this.config);
  }

  /** 为风格添加角色 */
  addCharacter(styleName: string, character: CharacterConfig): boolean {
    if (!this.config) return false;
    if (!this.config[styleName]) {
      console.error(`[敌人配置] 风格不存在: ${styleName}`);
      return false;
    }
    this.config[styleName].characters.push(character);
    return this.saveConfig(this.config);
  }
}

// 全局单例
export const enemyConfigService = new EnemyConfigService();
