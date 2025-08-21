import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Sunucu hatası";

  // Error log
  logger.error("Error occurred", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  const response: any = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};
