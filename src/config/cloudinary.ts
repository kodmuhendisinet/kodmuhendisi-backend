import { serverConfig } from "./server";

export const cloudinaryConfig = {
  cloud_name: serverConfig.cloudinaryCloudName,
  api_key: serverConfig.cloudinaryApiKey,
  api_secret: serverConfig.cloudinaryApiSecret,
  upload_preset: "markaflow",
  allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx"],
  max_file_size: 25 * 1024 * 1024, //25mb
  transformation: {
    quality: "auto",
    fetch_format: "auto",
  },
};
