// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { serverConfig } from "./config/server";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import healthRoutes from "./routes/health";

const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(
  cors({
    origin: serverConfig.corsOrigins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Routes
app.use("/api/health", healthRoutes);

// Ana route
app.get("/", (req, res) => {
  res.json({
    message: "Markaflow V3 Backend API",
    version: "3.0.0",
    status: "running",
  });
});

// 404 handler
app.use(notFound);

// Error handler (en sonda olmalı)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

// Sunucuyu başlat
const startServer = async () => {
  try {
    // Veritabanına bağlan
    await connectDatabase();

    // Sunucuyu dinlemeye başla
    app.listen(serverConfig.port, () => {
      console.log(`🚀 Server running on port ${serverConfig.port}`);
      console.log(`📊 Environment: ${serverConfig.nodeEnv}`);
      console.log(`🌐 URL: http://localhost:${serverConfig.port}`);
    });
  } catch (error) {
    console.error("❌ Server başlatılamadı:", error);
    process.exit(1);
  }
};

startServer();

export default app;
