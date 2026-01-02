import * as fs from 'fs';
import * as path from 'path';

/** Prompt风格配置 */
export interface PromptStyleConfig {
  name: string;
  description: string;
  systemPrompt: string;
  style: string;
  templates: string[];
}

/** Prompt风格管理服务 */
export class PromptStyleService {
  private styles: Map<string, PromptStyleConfig> = new Map();
  private currentStyle: string = 'default';
  private currentStyleObject: PromptStyleConfig | null = null; // 临时风格对象
  private stylesDir: string;

  constructor() {
    this.stylesDir = path.join(__dirname, 'styles');
    this.loadAllStyles();
  }

  /** 加载所有风格文件 */
  private loadAllStyles(): void {
    if (!fs.existsSync(this.stylesDir)) {
      console.warn('[Prompt风格] styles目录不存在，创建目录');
      fs.mkdirSync(this.stylesDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(this.stylesDir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      const styleName = path.basename(file, '.json');
      try {
        const filePath = path.join(this.stylesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const config: PromptStyleConfig = JSON.parse(content);
        this.styles.set(styleName, config);
        console.log(`[Prompt风格] 已加载风格: ${config.name} (${styleName})`);
      } catch (error) {
        console.error(`[Prompt风格] 加载风格失败: ${styleName}`, error);
      }
    });

    if (this.styles.size === 0) {
      console.warn('[Prompt风格] 未找到任何风格配置');
    } else {
      console.log(`[Prompt风格] 共加载 ${this.styles.size} 个风格`);
    }
  }

  /** 重新加载所有风格 */
  reloadStyles(): void {
    this.styles.clear();
    this.loadAllStyles();
  }

  /** 获取所有风格列表 */
  getStyleList(): { name: string; description: string }[] {
    return Array.from(this.styles.entries()).map(([key, config]) => ({
      name: key,
      description: config.description,
    }));
  }

  /** 获取指定风格配置 */
  getStyle(styleName: string): PromptStyleConfig | null {
    return this.styles.get(styleName) || null;
  }

  /** 设置当前风格 */
  setCurrentStyle(styleName: string): boolean {
    if (!this.styles.has(styleName)) {
      console.error(`[Prompt风格] 风格不存在: ${styleName}`);
      return false;
    }
    this.currentStyle = styleName;
    console.log(`[Prompt风格] 已切换到: ${this.styles.get(styleName)!.name}`);
    return true;
  }

  /** 获取当前风格 */
  getCurrentStyle(): PromptStyleConfig | null {
    // 优先返回临时风格对象
    if (this.currentStyleObject) {
      return this.currentStyleObject;
    }
    return this.styles.get(this.currentStyle) || null;
  }

  /** 设置临时风格对象（用于嵌入式风格） */
  setCurrentStyleObject(styleConfig: PromptStyleConfig | null): void {
    this.currentStyleObject = styleConfig;
  }

  /** 获取当前风格名称 */
  getCurrentStyleName(): string {
    return this.currentStyle;
  }

  /** 保存新风格 */
  saveStyle(styleName: string, config: PromptStyleConfig): boolean {
    try {
      const filePath = path.join(this.stylesDir, `${styleName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
      this.styles.set(styleName, config);
      console.log(`[Prompt风格] 已保存风格: ${config.name} (${styleName})`);
      return true;
    } catch (error) {
      console.error(`[Prompt风格] 保存风格失败: ${styleName}`, error);
      return false;
    }
  }

  /** 删除风格 */
  deleteStyle(styleName: string): boolean {
    if (styleName === 'default') {
      console.error('[Prompt风格] 不能删除默认风格');
      return false;
    }

    try {
      const filePath = path.join(this.stylesDir, `${styleName}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.styles.delete(styleName);
        console.log(`[Prompt风格] 已删除风格: ${styleName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[Prompt风格] 删除风格失败: ${styleName}`, error);
      return false;
    }
  }
}

// 全局单例
export const promptStyleService = new PromptStyleService();
