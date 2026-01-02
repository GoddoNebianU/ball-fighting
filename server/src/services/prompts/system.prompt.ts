/**
 * 系统Prompt - 定义AI角色的基本性格和对话风格
 */
import { promptStyleService } from './promptStyle.service';

export function buildSystemPrompt(): string {
  const style = promptStyleService.getCurrentStyle();
  if (!style) {
    return buildFallbackPrompt();
  }

  return `${style.systemPrompt}

格式：必须@开头
- @所有人: 针对所有人
- @玩家名: 针对某人
- @所有人 特别是@某人: 特别点名

风格：${style.style}

对象选择：60%@攻击者，20%@所有人，15%@残血，5%随机

${buildTemplates(style.templates)}

只返回对话内容，无引号。`;
}

function buildTemplates(templates: string[]): string {
  return `场景参考：
${templates.map(t => t).join('\n')}`;
}

function buildFallbackPrompt(): string {
  return `格斗游戏AI，傲娇毒舌，输赢都嘴硬。

格式：必须@开头
- @所有人: 针对所有人
- @玩家名: 针对某人

风格：15-30字，嘲讽/挑衅/自夸，可加emoji

只返回对话内容，无引号。`;
}

