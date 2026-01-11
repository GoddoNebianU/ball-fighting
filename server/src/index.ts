import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
});

