import express, { Request, Response } from "express";
import { llmQueue } from "../services/llmQueue.service";
import { chatHistory } from "../services/chatHistory.service";

const router = express.Router();

// POST /api/chat/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { gameState, playerName, recentMessages, killHistory } = req.body;

    // 验证必需参数
    if (!gameState) {
      return res.status(400).json({
        error: "缺少必需参数: gameState",
      });
    }

    // 获取最近的对话历史（如果没有从请求中获取）
    const history = recentMessages || chatHistory.getRecentMessages();

    // 使用队列服务，确保请求串行处理
    const message = await llmQueue.enqueue(
      gameState,
      playerName,
      history,
      killHistory,
    );

    // 保存到历史记录
    const actualPlayerName = playerName || "AI";
    chatHistory.addMessage(actualPlayerName, message);

    res.json({
      message: message,
      playerName: actualPlayerName,
      timestamp: Date.now(),
      queueLength: llmQueue.queueLength, // 返回当前队列长度
    });
  } catch (error) {
    console.error("生成对话失败:", error);
    res.status(500).json({
      error: "生成对话失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/clear - 清空对话历史
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

// GET /api/chat/history - 获取对话历史
router.get("/history", (_req: Request, res: Response) => {
  try {
    const history = chatHistory.getRecentMessages();
    res.json({
      messages: history,
      count: history.length,
    });
  } catch (error) {
    console.error("获取对话历史失败:", error);
    res.status(500).json({
      error: "获取对话历史失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/chat/clear-player - 清空指定玩家的队列
router.post("/clear-player", (req: Request, res: Response) => {
  try {
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({
        error: "缺少必需参数: playerName",
      });
    }

    llmQueue.clearPlayerTasks(playerName);

    res.json({
      success: true,
      message: `已清空玩家 "${playerName}" 的队列`,
      playerName,
    });
  } catch (error) {
    console.error("清空玩家队列失败:", error);
    res.status(500).json({
      error: "清空玩家队列失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
