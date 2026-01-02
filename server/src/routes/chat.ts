import express, { Request, Response } from "express";
import { llmQueue } from "../services/llmQueue.service";
import { chatHistory } from "../services/chatHistory.service";
import { promptStyleService } from "../services/prompts/promptStyle.service";
import { enemyConfigService } from "../services/prompts/enemyConfig.service";

const router = express.Router();

// POST /api/chat/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { gameState, playerName, recentMessages, killHistory, style, messageLength } = req.body;

    if (!gameState) {
      return res.status(400).json({ error: "缺少必需参数: gameState" });
    }

    // 如果请求中指定了 style 对象，临时设置风格
    const previousStyle = promptStyleService.getCurrentStyle();
    if (style && style !== previousStyle) {
      promptStyleService.setCurrentStyleObject(style);
    }

    const history = recentMessages || chatHistory.getRecentMessages();
    const message = await llmQueue.enqueue(
      gameState,
      playerName,
      history,
      killHistory,
      messageLength || 50,
    );
    const actualPlayerName = playerName || "AI";
    chatHistory.addMessage(actualPlayerName, message);

    // 恢复之前的风格
    if (style && style !== previousStyle) {
      promptStyleService.setCurrentStyleObject(previousStyle);
    }

    res.json({
      message: message,
      playerName: actualPlayerName,
      timestamp: Date.now(),
      queueLength: llmQueue.queueLength,
    });
  } catch (error) {
    console.error("生成对话失败:", error);
    res.status(500).json({
      error: "生成对话失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/clear
router.post("/clear", (_req: Request, res: Response) => {
  try {
    chatHistory.clear();
    res.json({ success: true, message: "对话历史已清空" });
  } catch (error) {
    console.error("清空对话历史失败:", error);
    res.status(500).json({
      error: "清空对话历史失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/chat/history
router.get("/history", (_req: Request, res: Response) => {
  try {
    const history = chatHistory.getRecentMessages();
    res.json({ messages: history, count: history.length });
  } catch (error) {
    console.error("获取对话历史失败:", error);
    res.status(500).json({
      error: "获取对话历史失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/clear-player
router.post("/clear-player", (req: Request, res: Response) => {
  try {
    const { playerName } = req.body;
    if (!playerName) {
      return res.status(400).json({ error: "缺少必需参数: playerName" });
    }
    llmQueue.clearPlayerTasks(playerName);
    res.json({ success: true, message: `已清空玩家 "${playerName}" 的队列`, playerName });
  } catch (error) {
    console.error("清空玩家队列失败:", error);
    res.status(500).json({
      error: "清空玩家队列失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/chat/styles - 获取所有可用风格
router.get("/styles", (_req: Request, res: Response) => {
  try {
    const styles = promptStyleService.getStyleList();
    const currentStyle = promptStyleService.getCurrentStyleName();
    res.json({ styles, currentStyle });
  } catch (error) {
    console.error("获取风格列表失败:", error);
    res.status(500).json({
      error: "获取风格列表失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/chat/styles/current - 获取当前风格
router.get("/styles/current", (_req: Request, res: Response) => {
  try {
    const currentStyle = promptStyleService.getCurrentStyle();
    if (!currentStyle) {
      return res.status(404).json({ error: "未找到当前风格" });
    }
    res.json({ name: promptStyleService.getCurrentStyleName(), config: currentStyle });
  } catch (error) {
    console.error("获取当前风格失败:", error);
    res.status(500).json({
      error: "获取当前风格失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/styles/switch - 切换风格
router.post("/styles/switch", (req: Request, res: Response) => {
  try {
    const { styleName } = req.body;
    if (!styleName) {
      return res.status(400).json({ error: "缺少必需参数: styleName" });
    }
    const success = promptStyleService.setCurrentStyle(styleName);
    if (!success) {
      return res.status(404).json({ error: `风格不存在: ${styleName}` });
    }
    res.json({ success: true, message: `已切换到风格: ${styleName}`, currentStyle: styleName });
  } catch (error) {
    console.error("切换风格失败:", error);
    res.status(500).json({
      error: "切换风格失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/styles/reload - 重新加载所有风格
router.post("/styles/reload", (_req: Request, res: Response) => {
  try {
    promptStyleService.reloadStyles();
    enemyConfigService.reloadConfig();
    const styles = promptStyleService.getStyleList();
    res.json({ success: true, message: "风格列表已重新加载", count: styles.length });
  } catch (error) {
    console.error("重新加载风格失败:", error);
    res.status(500).json({
      error: "重新加载风格失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/chat/enemies/:style - 获取指定风格的敌人配置
router.get("/enemies/:style", (req: Request, res: Response) => {
  try {
    const { style } = req.params;
    const characters = enemyConfigService.getStyleCharacters(style);
    const styleConfig = enemyConfigService.getStyleEnemies(style);
    res.json({
      style,
      styleName: styleConfig?.name || style,
      characters,
      count: characters.length,
    });
  } catch (error) {
    console.error("获取敌人配置失败:", error);
    res.status(500).json({
      error: "获取敌人配置失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/chat/enemies - 获取所有风格的敌人概览
router.get("/enemies", (_req: Request, res: Response) => {
  try {
    const allStyles = enemyConfigService.getAllStyles();
    res.json({ styles: allStyles });
  } catch (error) {
    console.error("获取敌人概览失败:", error);
    res.status(500).json({
      error: "获取敌人概览失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
