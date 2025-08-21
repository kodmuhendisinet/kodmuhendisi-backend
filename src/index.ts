// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/database";
import logger from "./config/logger";
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middleware'ler
app.use(helmet());
app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint bulunamadı",
  });
});

const PORT = process.env["PORT"] || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      logger.info(`Server ${PORT} portunda çalışıyor`);
    });
  } catch (error) {
    logger.error("Server başlatma hatası:", error);
    process.exit(1);
  }
};

startServer();
