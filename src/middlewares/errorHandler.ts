import { Response, Request, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isoperational?: boolean;
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
  console.error("Error:", {
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
    ...(process.env["NODE_ENV"] === "development" && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};
