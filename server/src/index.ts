import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat";
import { promptStyleService } from "./services/prompts/promptStyle.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/chat", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: unknown, _res: unknown, _next: unknown) => {
  console.error("服务器错误:", err);
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`💬 对话API: http://localhost:${PORT}/api/chat/generate`);
  console.log(`🎨 Prompt风格: ${promptStyleService.getStyleList().length} 个已加载`);
  console.log(`🎨 当前风格: ${promptStyleService.getCurrentStyleName()}`);
});

