import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Kullanıcı Rolleri Enum'u
 * Sistemdeki farklı kullanıcı tiplerini ve yetkilerini tanımlar
 */
export enum UserRole {
  SUPER_ADMIN = "super_admin", // Süper Admin - Tüm yetkilere sahip
  ADMIN = "admin", // Admin - Sistem yönetimi
  PROJECT_MANAGER = "project_manager", // Proje Yöneticisi - Proje yönetimi
  SEO_SPECIALIST = "seo_specialist", // SEO Uzmanı - SEO işlemleri
  DESIGNER = "designer", // Tasarımcı - Tasarım işlemleri
  DEVELOPER = "developer", // Geliştirici - Yazılım geliştirme
  CUSTOMER_SERVICE = "customer_service", // Müşteri Hizmetleri - Destek
  HR_MANAGER = "hr_manager", // İK Yöneticisi - İnsan kaynakları
  CUSTOMER = "customer", // Müşteri - Dış kullanıcı
}

/**
 * Kullanıcı Durumu Enum'u
 * Kullanıcının sistemdeki aktiflik durumunu belirtir
 */
export enum UserStatus {
  ACTIVE = "active", // Aktif - Tam erişim
  INACTIVE = "inactive", // Pasif - Erişim kısıtlı
  SUSPENDED = "suspended", // Askıya alınmış - Geçici erişim engeli
  PENDING = "pending", // Beklemede - Onay bekliyor
}

/**
 * Kullanıcı Instance Metodları Interface'i
 * Tek bir kullanıcı üzerinde işlem yapan metodların tiplerini tanımlar
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<IUser>;
  activate(): Promise<IUser>;
  suspend(): Promise<IUser>;
}

/**
 * Kullanıcı Static Metodları Interface'i
 * Model seviyesinde işlem yapan metodların tiplerini tanımlar
 */
export interface IUserStatics {
  findByEmail(email: string): mongoose.Query<IUser | null, IUser>;
  getActiveUsersCount(): mongoose.Query<number, IUser>;
  getUsersByRole(role: UserRole): mongoose.Query<IUser[], IUser>;
}

/**
 * Kullanıcı Interface'i
 * Mongoose Document'ini extend ederek kullanıcı verilerinin tipini tanımlar
 */
export interface IUser extends Document, IUserMethods {
  // Temel Kimlik Bilgileri
  email: string; // Benzersiz email adresi
  password: string; // Şifrelenmiş parola
  firstName: string; // Ad
  lastName: string; // Soyad
  phone?: string; // Telefon numarası (opsiyonel)
  avatar?: string; // Profil fotoğrafı URL'i (opsiyonel)

  // Yetki ve Durum
  role: UserRole; // Kullanıcı rolü
  status: UserStatus; // Kullanıcı durumu

  // İş Bilgileri (opsiyonel)
  company?: string; // Şirket adı
  position?: string; // Pozisyon

  // Sistem Bilgileri
  joinDate: Date; // Kayıt tarihi
  lastLogin?: Date; // Son giriş tarihi

  // Email Doğrulama
  isEmailVerified: boolean; // Email doğrulandı mı?
  emailVerificationToken?: string | null; // Email doğrulama token'ı
  passwordResetToken?: string | null; // Şifre sıfırlama token'ı
  passwordResetExpires?: Date | null; // Token geçerlilik süresi

  // Kullanıcı Tercihleri
  preferences: {
    theme: "light" | "dark"; // Tema tercihi
    language: "tr" | "en"; // Dil tercihi
    notifications: {
      email: boolean; // Email bildirimleri
      push: boolean; // Push bildirimleri
      sms: boolean; // SMS bildirimleri
    };
  };

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Kullanıcı Model Interface'i
 * Mongoose Model'ini extend ederek static metodları tanımlar
 */
export interface IUserModel
  extends Model<IUser, {}, IUserMethods>,
    IUserStatics {}

/**
 * Kullanıcı Şeması
 * MongoDB'de kullanıcı verilerinin nasıl saklanacağını tanımlar
 */
const userSchema = new Schema<IUser, IUserModel>(
  {
    // Email - Benzersiz ve zorunlu
    email: {
      type: String,
      required: [true, "Email adresi zorunludur"],
      unique: true,
      lowercase: true, // Küçük harfe çevir
      trim: true, // Boşlukları temizle
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Geçerli bir email adresi giriniz",
      ],
    },

    // Şifre - En az 6 karakter
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
    },

    // Ad ve Soyad
    firstName: {
      type: String,
      required: [true, "Ad zorunludur"],
      trim: true,
      maxlength: [50, "Ad en fazla 50 karakter olabilir"],
    },
    lastName: {
      type: String,
      required: [true, "Soyad zorunludur"],
      trim: true,
      maxlength: [50, "Soyad en fazla 50 karakter olabilir"],
    },

    // İletişim Bilgileri (opsiyonel)
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Geçerli bir telefon numarası giriniz"],
    },
    avatar: {
      type: String,
      match: [/^https?:\/\/.+/, "Geçerli bir URL giriniz"],
    },

    // Rol ve Durum
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Geçersiz kullanıcı rolü",
      },
      default: UserRole.CUSTOMER,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(UserStatus),
        message: "Geçersiz kullanıcı durumu",
      },
      default: UserStatus.PENDING,
    },

    // İş Bilgileri (opsiyonel)
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Şirket adı en fazla 100 karakter olabilir"],
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, "Pozisyon en fazla 100 karakter olabilir"],
    },

    // Sistem Bilgileri
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },

    // Email Doğrulama
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

    // Kullanıcı Tercihleri
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["tr", "en"],
        default: "tr",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

/**
 * Şifre Hashleme Middleware
 * Kullanıcı kaydedilmeden önce şifreyi bcrypt ile hashler
 */
userSchema.pre("save", async function (next) {
  // Şifre değişmemişse işlem yapma
  if (!this.isModified("password")) return next();

  try {
    // 12 round'lık salt oluştur ve şifreyi hashle
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Şifre Karşılaştırma Metodu
 * Girilen şifreyi hashlenmiş şifre ile karşılaştırır
 * @param candidatePassword - Karşılaştırılacak şifre
 * @returns Promise<boolean> - Eşleşme durumu
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Veritabanı Index'leri
 * Sorgu performansını artırmak için oluşturulan index'ler
 */
userSchema.index({ email: 1 }); // Email ile hızlı arama
userSchema.index({ role: 1 }); // Role göre filtreleme
userSchema.index({ status: 1 }); // Durum göre filtreleme
userSchema.index({ company: 1 }); // Şirket göre filtreleme

// Compound index'ler - birden fazla alan için
userSchema.index({ role: 1, status: 1 }); // Rol ve durum birlikte
userSchema.index({ email: 1, status: 1 }); // Email ve durum birlikte

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("isActive").get(function () {
  return this.status === UserStatus.ACTIVE;
});

userSchema.virtual("isAdmin").get(function () {
  return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm kullanıcılar üzerinde işlem yapan metodlar
 */
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getActiveUsersCount = function () {
  return this.countDocuments({ status: UserStatus.ACTIVE });
};

userSchema.statics.getUsersByRole = function (role: UserRole) {
  return this.find({ role, status: UserStatus.ACTIVE });
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir kullanıcı üzerinde işlem yapan metodlar
 */
userSchema.methods.updateLastLogin = function () {
  this["lastLogin"] = new Date();
  return this["save"]();
};

userSchema.methods.activate = function () {
  this["status"] = UserStatus.ACTIVE;
  return this["save"]();
};

userSchema.methods.suspend = function () {
  this["status"] = UserStatus.SUSPENDED;
  return this["save"]();
};

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
