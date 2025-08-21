import { Request, Response, NextFunction } from "express";

// Kayıt validasyonu
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName } = req.body;
  const errors: string[] = [];

  // Email kontrolü
  if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
    errors.push("Geçerli bir email adresi giriniz");
  }

  // Şifre kontrolü
  if (!password || password.length < 6) {
    errors.push("Şifre en az 6 karakter olmalıdır");
  }
  // Ad kontrolü
  if (!firstName || firstName.trim().length < 2) {
    errors.push("Ad en az 2 karakter olmalıdır");
  }
  // Soyad kontrolü
  if (!lastName || lastName.trim().length < 2) {
    errors.push("Soyad en az 2 karakter olmalıdır");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validasyon hatası",
      errors,
    });
  }
  next();
};

// Giriş validasyonu
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email) {
    errors.push("Email adresi gerekli");
  }
  if (!password) {
    errors.push("Şifre gerekli");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validasyon hatası",
      errors,
    });
  }
  next();
};
