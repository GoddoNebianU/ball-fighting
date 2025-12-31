import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use("/api/chat", chatRouter);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// 错误处理
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: unknown, _res: unknown, _next: unknown) => {
  console.error("服务器错误:", err);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`💬 对话API: http://localhost:${PORT}/api/chat/generate`);
});
