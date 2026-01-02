/**
 * Zhipu API 相关类型定义
 */

export interface ZhipuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ZhipuRequest {
  model: string;
  messages: ZhipuMessage[];
  temperature: number;
}

export interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
