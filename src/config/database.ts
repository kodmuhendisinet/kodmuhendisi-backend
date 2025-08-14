// src/config/database.ts
import mongoose from "mongoose";
import { serverConfig } from "./server";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = serverConfig.mongoUri;

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB bağlantısı başarılı");

    // Bağlantı event'lerini dinle
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB bağlantı hatası:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB bağlantısı kesildi");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("�� MongoDB yeniden bağlandı");
    });
  } catch (error) {
    console.error("❌ MongoDB bağlantısı kurulamadı:", error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ MongoDB bağlantısı kapatılamadı:", error);
    throw error;
  }
};
