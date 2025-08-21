import dotenv from "dotenv";

dotenv.config();

export const serverConfig = {
  port: process.env["PORT"] || 5000,
  nodeEnv: process.env["NODE_ENV"] || "development",
  corsOrigins: process.env["CORS_ORIGINS"]?.split(",") || [
    "http://localhost:3000",
  ],

  jwtSecret: process.env["JWT_SECRET"] || "a23Yi43643RzP5e7Yhdfs6SiYu9z",
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "365d",
  mongoUri: process.env["MONGO_URI"] || "mongodb://localhost:27017/markaflow",
  emailHost: process.env["EMAIL_HOST"],
  emailPort: process.env["EMAIL_PORT"],
  emailUser: process.env["EMAIL_USER"],
  emailPass: process.env["EMAIL_PASS"],
  cloudinaryCloudName: process.env["CLOUDINARY_CLOUD_NAME"],
  cloudinaryApiKey: process.env["CLOUDINARY_API_KEY"],
  cloudinaryApiSecret: process.env["CLOUDINARY_API_SECRET"],
};
