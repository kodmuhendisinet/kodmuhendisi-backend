import express from "express";
import { 
  register, 
  login, 
  getMe,
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  refreshToken, 
  logout 
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/auth";
import { validateRegister, validateLogin } from "../middlewares/validation";

const router = express.Router();

// Kayıt olma
router.post("/register", validateRegister, register);

// Giriş yapma
router.post("/login", validateLogin, login);

// Kullanıcı bilgilerini getir (korumalı)
router.get("/me", authenticateToken, getMe);

// Email doğrulama
router.get("/verify-email/:token", verifyEmail);

// Şifre sıfırlama isteği
router.post("/forgot-password", forgotPassword);

// Şifre sıfırlama
router.post("/reset-password", resetPassword);

// Token yenileme
router.post("/refresh", refreshToken);

// Çıkış yapma
router.post("/logout", logout);

export default router;
