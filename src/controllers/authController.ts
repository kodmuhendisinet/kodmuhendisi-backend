// backend/src/controllers/authController.ts

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, UserRole, UserStatus } from "../models/User";
import { authConfig } from "../config/auth";
import logger from "../config/logger";

// JWT Token oluşturma fonksiyonu
const generateTokens = (userId: string, role: UserRole) => {
  const accessToken = jwt.sign({ userId, role }, authConfig.jwtSecret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId, role }, authConfig.jwtSecret, {
    expiresIn: "180d",
  });

  return { accessToken, refreshToken };
};

// Kayıt olma
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, company, position } =
      req.body;

    // Email kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Bu email adresi zaten kullanılıyor",
      });
      return;
    }

    // Email doğrulama token'ı oluştur
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Yeni kullanıcı oluştur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      position,
      role: UserRole.CUSTOMER,
      status: UserStatus.PENDING,
      emailVerificationToken,
      preferences: {
        theme: "light",
        language: "tr",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
    });

    await user.save();

    // Email doğrulama gönder (bu kısım email servisi ile entegre edilecek)
    // await sendVerificationEmail(user.email, emailVerificationToken);

    logger.info(`Yeni kullanıcı kaydı: ${email}`);

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı! Email adresinizi doğrulayın.",
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error("Kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt işlemi sırasında bir hata oluştu",
    });
  }
};

// Giriş yapma
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
      return;
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
      return;
    }

    // Kullanıcı durumu kontrolü
    if (user.status !== UserStatus.ACTIVE) {
      res.status(403).json({
        success: false,
        message: "Hesabınız henüz aktif değil. Email doğrulamasını tamamlayın.",
      });
      return;
    }

    // Son giriş tarihini güncelle
    await user.updateLastLogin();

    // Token'ları oluştur
    const tokens = generateTokens((user._id as any).toString(), user.role);

    logger.info(`Kullanıcı girişi: ${email}`);

    res.json({
      success: true,
      message: "Giriş başarılı",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
        tokens,
      },
    });
  } catch (error) {
    logger.error("Giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Giriş işlemi sırasında bir hata oluştu",
    });
  }
};

// Email doğrulama
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Geçersiz doğrulama token'ı",
      });
      return;
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.emailVerificationToken = null;
    await user.save();

    logger.info(`Email doğrulandı: ${user.email}`);

    res.json({
      success: true,
      message: "Email adresiniz başarıyla doğrulandı!",
    });
  } catch (error) {
    logger.error("Email doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Email doğrulama sırasında bir hata oluştu",
    });
  }
};

// Şifre sıfırlama isteği
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Bu email adresi ile kayıtlı kullanıcı bulunamadı",
      });
      return;
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 saat
    await user.save();

    // Şifre sıfırlama email'i gönder
    // await sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Şifre sıfırlama isteği: ${email}`);

    res.json({
      success: true,
      message: "Şifre sıfırlama bağlantısı email adresinize gönderildi",
    });
  } catch (error) {
    logger.error("Şifre sıfırlama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Şifre sıfırlama işlemi sırasında bir hata oluştu",
    });
  }
};

// Şifre sıfırlama
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş token",
      });
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    logger.info(`Şifre sıfırlandı: ${user.email}`);

    res.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi",
    });
  } catch (error) {
    logger.error("Şifre sıfırlama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Şifre sıfırlama sırasında bir hata oluştu",
    });
  }
};

// Token yenileme
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token gerekli",
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, authConfig.jwtSecret) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Geçersiz refresh token",
      });
      return;
    }

    const tokens = generateTokens((user._id as any).toString(), user.role);

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    logger.error("Token yenileme hatası:", error);
    res.status(401).json({
      success: false,
      message: "Geçersiz refresh token",
    });
  }
};

// Kullanıcı bilgilerini getir
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Kimlik doğrulama gerekli",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          company: user.company,
          position: user.position,
          isEmailVerified: user.isEmailVerified,
          joinDate: user.joinDate,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    logger.error("Kullanıcı bilgileri getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı bilgileri alınırken bir hata oluştu",
    });
  }
};

// Çıkış yapma
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // JWT stateless olduğu için client tarafında token'ı silmek yeterli
    // Eğer blacklist sistemi istiyorsanız burada implement edebilirsiniz

    res.json({
      success: true,
      message: "Başarıyla çıkış yapıldı",
    });
  } catch (error) {
    logger.error("Çıkış hatası:", error);
    res.status(500).json({
      success: false,
      message: "Çıkış işlemi sırasında bir hata oluştu",
    });
  }
};
