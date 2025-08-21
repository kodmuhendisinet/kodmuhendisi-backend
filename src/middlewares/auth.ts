import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authConfig } from "@/config/auth";
import logger from "winston";

// Request interface'ini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT Token doğrulama middleware'i
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Erişim token'ı gerekli",
      });
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as any;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    logger.error("Token doğrulama hatası:", err);
    return res.status(403).json({
      success: false,
      message: "Geçersiz token",
    });
  }
};
// Rol bazlı yetkilendirme middleware'i
export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Yetkilendirme gerekli",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz bulunmuyor",
      });
    }
    next();
  };
};

// Aktif kullanıcı kontrolü
export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Giriş yapmanız gerekiyor",
    });
  }
  if (req.user.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Hesabınız aktif değil",
    });
  }
  next();
};
