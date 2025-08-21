import mongoose, { Document, Schema } from "mongoose";

/**
 * Departman Enum'u
 * Şirket içindeki farklı departmanları tanımlar
 */
export enum Department {
  DEVELOPMENT = "development", // Geliştirme - Yazılım geliştirme
  DESIGN = "design", // Tasarım - Grafik ve UI tasarım
  SEO = "seo", // SEO - Arama motoru optimizasyonu
  MARKETING = "marketing", // Pazarlama - Dijital pazarlama
  SALES = "sales", // Satış - Müşteri satışı
  CUSTOMER_SERVICE = "customer_service", // Müşteri Hizmetleri - Destek
  HR = "hr", // İnsan Kaynakları - İK yönetimi
  FINANCE = "finance", // Finans - Mali işler
  ADMINISTRATION = "administration", // Yönetim - Genel yönetim
}

/**
 * Çalışan Durumu Enum'u
 * Çalışanın şirketteki aktiflik durumunu belirtir
 */
export enum EmployeeStatus {
  ACTIVE = "active", // Aktif - Tam zamanlı çalışıyor
  PROBATION = "probation", // Deneme - Deneme sürecinde
  SUSPENDED = "suspended", // Askıya Alınmış - Geçici durdurma
  TERMINATED = "terminated", // İşten Çıkarıldı - İşten ayrıldı
  RESIGNED = "resigned", // İstifa - Kendi isteğiyle ayrıldı
}

/**
 * İstihdam Türü Enum'u
 * Çalışanın istihdam şeklini belirtir
 */
export enum EmploymentType {
  FULL_TIME = "full_time", // Tam Zamanlı - Tam zamanlı çalışma
  PART_TIME = "part_time", // Yarı Zamanlı - Yarı zamanlı çalışma
  CONTRACT = "contract", // Sözleşmeli - Belirli süreli sözleşme
  INTERN = "intern", // Stajyer - Staj programı
  FREELANCE = "freelance", // Serbest - Serbest çalışan
}

/**
 * Çalışan Interface'i
 * Mongoose Document'ini extend ederek çalışan verilerinin tipini tanımlar
 */
export interface IEmployee extends Document {
  // Temel Çalışan Bilgileri
  userId: mongoose.Types.ObjectId; // Kullanıcı referansı
  employeeId: string; // Şirket içi çalışan numarası
  department: Department; // Departman
  position: string; // Pozisyon
  employmentType: EmploymentType; // İstihdam türü

  // İş Bilgileri
  hireDate: Date; // İşe başlama tarihi
  salary: number; // Maaş
  managerId?: mongoose.Types.ObjectId; // Yönetici (opsiyonel)

  // Yetenekler ve Sertifikalar
  skills: string[]; // Yetenekler
  certifications: string[]; // Sertifikalar

  // Performans
  performanceRating?: number; // Performans puanı (1-5)
  lastReviewDate?: Date; // Son değerlendirme tarihi
  nextReviewDate?: Date; // Sonraki değerlendirme tarihi
  status: EmployeeStatus; // Çalışan durumu

  // İş Programı
  workSchedule: {
    startTime: string; // Başlangıç saati (HH:mm)
    endTime: string; // Bitiş saati (HH:mm)
    workDays: number[]; // Çalışma günleri (0-6)
    timezone: string; // Zaman dilimi
  };

  // İletişim Bilgileri
  contactInfo: {
    emergencyContact: {
      name: string; // Acil durum kişisi adı
      relationship: string; // İlişki
      phone: string; // Telefon
      email?: string; // Email (opsiyonel)
    };
    address: {
      street: string; // Sokak
      city: string; // Şehir
      state: string; // İl/Eyalet
      zipCode: string; // Posta kodu
      country: string; // Ülke
    };
  };

  // Sosyal Haklar
  benefits: {
    healthInsurance: boolean; // Sağlık sigortası
    dentalInsurance: boolean; // Diş sigortası
    visionInsurance: boolean; // Göz sigortası
    retirementPlan: boolean; // Emeklilik planı
    paidTimeOff: number; // Ücretli izin (gün)
    sickLeave: number; // Hastalık izni (gün)
  };

  // Dokümanlar
  documents: {
    filename: string; // Dosya adı
    originalName: string; // Orijinal dosya adı
    url: string; // Dosya URL'i
    documentType: "contract" | "id" | "certificate" | "other"; // Doküman türü
    uploadedAt: Date; // Yükleme tarihi
  }[];

  // Notlar
  notes: {
    content: string; // Not içeriği
    author: mongoose.Types.ObjectId; // Yazan kullanıcı
    isPrivate: boolean; // Özel not mu?
    createdAt: Date; // Oluşturulma tarihi
  }[];

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Çalışan Şeması
 * MongoDB'de çalışan verilerinin nasıl saklanacağını tanımlar
 */
const employeeSchema = new Schema<IEmployee>(
  {
    // Temel İlişkiler
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Kullanıcı seçimi zorunludur"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Çalışan numarası zorunludur"],
      unique: true,
      trim: true,
      maxlength: [20, "Çalışan numarası en fazla 20 karakter olabilir"],
    },

    // İş Bilgileri
    department: {
      type: String,
      enum: {
        values: Object.values(Department),
        message: "Geçersiz departman",
      },
      required: [true, "Departman seçimi zorunludur"],
    },
    position: {
      type: String,
      required: [true, "Pozisyon zorunludur"],
      trim: true,
      maxlength: [100, "Pozisyon en fazla 100 karakter olabilir"],
    },
    employmentType: {
      type: String,
      enum: {
        values: Object.values(EmploymentType),
        message: "Geçersiz istihdam türü",
      },
      default: EmploymentType.FULL_TIME,
    },

    // İş Detayları
    hireDate: {
      type: Date,
      required: [true, "İşe başlama tarihi zorunludur"],
    },
    salary: {
      type: Number,
      required: [true, "Maaş bilgisi zorunludur"],
      min: [0, "Maaş negatif olamaz"],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    // Yetenekler ve Sertifikalar
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Yetenek adı en fazla 100 karakter olabilir"],
      },
    ],
    certifications: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Sertifika adı en fazla 200 karakter olabilir"],
      },
    ],

    // Performans
    performanceRating: {
      type: Number,
      min: [1, "Performans puanı en az 1 olmalıdır"],
      max: [5, "Performans puanı en fazla 5 olmalıdır"],
    },
    lastReviewDate: {
      type: Date,
    },
    nextReviewDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(EmployeeStatus),
        message: "Geçersiz çalışan durumu",
      },
      default: EmployeeStatus.ACTIVE,
    },

    // İş Programı
    workSchedule: {
      startTime: {
        type: String,
        default: "09:00",
        match: [
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Geçerli saat formatı giriniz (HH:mm)",
        ],
      },
      endTime: {
        type: String,
        default: "18:00",
        match: [
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Geçerli saat formatı giriniz (HH:mm)",
        ],
      },
      workDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5], // Pazartesi-Cuma
        validate: {
          validator: function (v: number[]) {
            return v.every((day) => day >= 0 && day <= 6);
          },
          message: "Çalışma günleri 0-6 arasında olmalıdır",
        },
      },
      timezone: {
        type: String,
        default: "Europe/Istanbul",
      },
    },

    // İletişim Bilgileri
    contactInfo: {
      emergencyContact: {
        name: {
          type: String,
          required: [true, "Acil durum kişisi adı zorunludur"],
          trim: true,
          maxlength: [100, "Ad en fazla 100 karakter olabilir"],
        },
        relationship: {
          type: String,
          required: [true, "İlişki bilgisi zorunludur"],
          trim: true,
          maxlength: [50, "İlişki en fazla 50 karakter olabilir"],
        },
        phone: {
          type: String,
          required: [true, "Telefon numarası zorunludur"],
          trim: true,
        },
        email: {
          type: String,
          trim: true,
          match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Geçerli bir email adresi giriniz",
          ],
        },
      },
      address: {
        street: {
          type: String,
          required: [true, "Sokak adresi zorunludur"],
          trim: true,
          maxlength: [200, "Sokak adresi en fazla 200 karakter olabilir"],
        },
        city: {
          type: String,
          required: [true, "Şehir adı zorunludur"],
          trim: true,
          maxlength: [100, "Şehir adı en fazla 100 karakter olabilir"],
        },
        state: {
          type: String,
          required: [true, "İl/Eyalet adı zorunludur"],
          trim: true,
          maxlength: [100, "İl/Eyalet adı en fazla 100 karakter olabilir"],
        },
        zipCode: {
          type: String,
          required: [true, "Posta kodu zorunludur"],
          trim: true,
          maxlength: [20, "Posta kodu en fazla 20 karakter olabilir"],
        },
        country: {
          type: String,
          required: [true, "Ülke adı zorunludur"],
          trim: true,
          maxlength: [100, "Ülke adı en fazla 100 karakter olabilir"],
        },
      },
    },

    // Sosyal Haklar
    benefits: {
      healthInsurance: {
        type: Boolean,
        default: true,
      },
      dentalInsurance: {
        type: Boolean,
        default: false,
      },
      visionInsurance: {
        type: Boolean,
        default: false,
      },
      retirementPlan: {
        type: Boolean,
        default: true,
      },
      paidTimeOff: {
        type: Number,
        default: 20,
        min: [0, "Ücretli izin günü negatif olamaz"],
      },
      sickLeave: {
        type: Number,
        default: 10,
        min: [0, "Hastalık izni günü negatif olamaz"],
      },
    },

    // Dokümanlar
    documents: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        documentType: {
          type: String,
          enum: ["contract", "id", "certificate", "other"],
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Notlar
    notes: [
      {
        content: {
          type: String,
          required: true,
          maxlength: [2000, "Not içeriği en fazla 2000 karakter olabilir"],
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        isPrivate: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

/**
 * Veritabanı Index'leri
 * Sorgu performansını artırmak için oluşturulan index'ler
 */
employeeSchema.index({ userId: 1 }); // Kullanıcıya göre arama
employeeSchema.index({ employeeId: 1 }); // Çalışan numarasına göre
employeeSchema.index({ department: 1 }); // Departmana göre filtreleme
employeeSchema.index({ status: 1 }); // Duruma göre filtreleme
employeeSchema.index({ managerId: 1 }); // Yöneticiye göre arama
employeeSchema.index({ hireDate: 1 }); // İşe başlama tarihine göre
employeeSchema.index({ skills: 1 }); // Yeteneklere göre arama

// Compound index'ler - birden fazla alan için
employeeSchema.index({ department: 1, status: 1 }); // Departman ve durum
employeeSchema.index({ managerId: 1, status: 1 }); // Yönetici ve durum
employeeSchema.index({ employmentType: 1, status: 1 }); // İstihdam türü ve durum

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
employeeSchema.virtual("tenure").get(function () {
  const now = new Date();
  const hireDate = this.hireDate;
  const diffTime = Math.abs(now.getTime() - hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365); // yıl cinsinden
});

employeeSchema.virtual("isProbation").get(function () {
  return this.status === EmployeeStatus.PROBATION;
});

employeeSchema.virtual("isActive").get(function () {
  return this.status === EmployeeStatus.ACTIVE;
});

employeeSchema.virtual("isManager").get(function () {
  return (
    this.position.toLowerCase().includes("manager") ||
    this.position.toLowerCase().includes("lead") ||
    this.position.toLowerCase().includes("head")
  );
});

employeeSchema.virtual("isNewHire").get(function () {
  const hireDate = this.hireDate;
  const now = new Date();
  const diffTime = now.getTime() - hireDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 90; // 90 günden yeni ise
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm çalışanlar üzerinde işlem yapan metodlar
 */
employeeSchema.statics.getActiveEmployeesCount = function () {
  return this.countDocuments({ status: EmployeeStatus.ACTIVE });
};

employeeSchema.statics.getDepartmentStats = function () {
  return this.aggregate([
    { $match: { status: EmployeeStatus.ACTIVE } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

employeeSchema.statics.getAverageSalary = function () {
  return this.aggregate([
    { $match: { status: EmployeeStatus.ACTIVE } },
    { $group: { _id: null, avgSalary: { $avg: "$salary" } } },
  ]);
};

employeeSchema.statics.getEmployeesByDepartment = function (
  department: Department
) {
  return this.find({ department, status: EmployeeStatus.ACTIVE }).populate(
    "userId"
  );
};

employeeSchema.statics.getManagers = function () {
  return this.find({
    $or: [
      { position: { $regex: /manager/i } },
      { position: { $regex: /lead/i } },
      { position: { $regex: /head/i } },
    ],
    status: EmployeeStatus.ACTIVE,
  });
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir çalışan üzerinde işlem yapan metodlar
 */
employeeSchema.methods.promote = function (
  newPosition: string,
  newSalary: number
) {
  this["position"] = newPosition;
  this["salary"] = newSalary;
  this["lastReviewDate"] = new Date();
  this["nextReviewDate"] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 yıl sonra
  return this["save"]();
};

employeeSchema.methods.updatePerformanceRating = function (rating: number) {
  this["performanceRating"] = rating;
  this["lastReviewDate"] = new Date();
  this["nextReviewDate"] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 yıl sonra
  return this["save"]();
};

employeeSchema.methods.terminate = function () {
  this["status"] = EmployeeStatus.TERMINATED;
  return this["save"]();
};

employeeSchema.methods.resign = function () {
  this["status"] = EmployeeStatus.RESIGNED;
  return this["save"]();
};

employeeSchema.methods.addSkill = function (skill: string) {
  if (!this["skills"].includes(skill)) {
    this["skills"].push(skill);
  }
  return this["save"]();
};

employeeSchema.methods.addCertification = function (certification: string) {
  if (!this["certifications"].includes(certification)) {
    this["certifications"].push(certification);
  }
  return this["save"]();
};

employeeSchema.methods.startProbation = function () {
  this["status"] = EmployeeStatus.PROBATION;
  return this["save"]();
};

employeeSchema.methods.completeProbation = function () {
  this["status"] = EmployeeStatus.ACTIVE;
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
employeeSchema.pre("save", function (next) {
  // Maaş kontrolü
  if (this["salary"] < 0) {
    return next(new Error("Maaş negatif olamaz"));
  }

  // İşe başlama tarihi kontrolü
  if (this["hireDate"] > new Date()) {
    return next(new Error("İşe başlama tarihi gelecekte olamaz"));
  }

  // Performans değerlendirme tarihi kontrolü
  if (
    this["performanceRating"] &&
    (this["performanceRating"] < 1 || this["performanceRating"] > 5)
  ) {
    return next(new Error("Performans puanı 1-5 arasında olmalıdır"));
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
