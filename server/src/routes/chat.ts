import express, { Request, Response } from "express";
import { ZhipuService } from "../services/zhipu.service";

const router = express.Router();

// POST /api/chat/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { gameState, playerName } = req.body;

    // 验证必需参数
    if (!gameState) {
      return res.status(400).json({
        error: "缺少必需参数: gameState",
      });
    }

    // 延迟初始化服务
    const zhipuService = new ZhipuService();

    // 调用智谱AI生成消息
    const message = await zhipuService.generateChatMessage(
      gameState,
      playerName,
    );

    res.json({
      message: message,
      playerName: playerName || "AI",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("生成对话失败:", error);
    res.status(500).json({
      error: "生成对话失败",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
