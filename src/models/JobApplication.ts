import mongoose, { Document, Schema } from "mongoose";

/**
 * Başvuru Durumu Enum'u
 * İş başvurusunun yaşam döngüsündeki farklı aşamalarını tanımlar
 */
export enum ApplicationStatus {
  PENDING = "pending", // Beklemede - Başvuru alındı, inceleniyor
  REVIEWING = "reviewing", // İnceleniyor - Başvuru değerlendiriliyor
  SHORTLISTED = "shortlisted", // Ön Eleme - Ön eleme geçti
  INTERVIEW_SCHEDULED = "interview_scheduled", // Mülakat Planlandı - Mülakat tarihi belirlendi
  INTERVIEWED = "interviewed", // Mülakat Yapıldı - Mülakat tamamlandı
  OFFER_MADE = "offer_made", // Teklif Verildi - İş teklifi yapıldı
  ACCEPTED = "accepted", // Kabul Edildi - Teklif kabul edildi
  REJECTED = "rejected", // Reddedildi - Başvuru reddedildi
  WITHDRAWN = "withdrawn", // Geri Çekildi - Başvuru geri çekildi
}

/**
 * Deneyim Seviyesi Enum'u
 * Başvuranın deneyim seviyesini belirtir
 */
export enum ExperienceLevel {
  ENTRY = "entry", // Giriş Seviyesi - Deneyim yok
  JUNIOR = "junior", // Junior - 1-3 yıl deneyim
  MID = "mid", // Orta Seviye - 3-5 yıl deneyim
  SENIOR = "senior", // Senior - 5-8 yıl deneyim
  LEAD = "lead", // Lead - 8+ yıl deneyim
  EXECUTIVE = "executive", // Yönetici - Yönetim deneyimi
}

/**
 * İş Başvurusu Interface'i
 * Mongoose Document'ini extend ederek iş başvurusu verilerinin tipini tanımlar
 */
export interface IJobApplication extends Document {
  // Temel Başvuru Bilgileri
  jobId: mongoose.Types.ObjectId; // İş ilanı referansı
  applicantId: mongoose.Types.ObjectId; // Başvuran kullanıcı
  status: ApplicationStatus; // Başvuru durumu

  // Başvuru İçeriği
  coverLetter: string; // Ön yazı
  resume: {
    filename: string; // Dosya adı
    originalName: string; // Orijinal dosya adı
    url: string; // Dosya URL'i
    size: number; // Dosya boyutu (byte)
    uploadedAt: Date; // Yükleme tarihi
  };

  // Portföy ve Referanslar
  portfolio?: {
    url: string; // Portföy URL'i
    description: string; // Portföy açıklaması
  };
  references: {
    name: string; // Referans kişi adı
    position: string; // Pozisyon
    company: string; // Şirket
    email: string; // Email
    phone: string; // Telefon
    relationship: string; // İlişki
  }[];

  // Deneyim ve Eğitim
  experience: {
    company: string; // Şirket adı
    position: string; // Pozisyon
    startDate: Date; // Başlangıç tarihi
    endDate?: Date; // Bitiş tarihi (opsiyonel)
    description: string; // İş açıklaması
    achievements: string[]; // Başarılar
  }[];
  education: {
    institution: string; // Eğitim kurumu
    degree: string; // Derece
    field: string; // Alan
    startDate: Date; // Başlangıç tarihi
    endDate?: Date; // Bitiş tarihi (opsiyonel)
    gpa?: number; // Not ortalaması (opsiyonel)
  }[];

  // Başvuru Detayları
  experienceLevel: ExperienceLevel; // Deneyim seviyesi
  expectedSalary?: number; // Beklenen maaş
  currentEmployment?: {
    company: string; // Mevcut şirket
    position: string; // Mevcut pozisyon
    noticePeriod: number; // İstifa süresi (gün)
  };

  // Yetenekler ve Sertifikalar
  skills: string[]; // Yetenekler
  certifications: string[]; // Sertifikalar

  // Mülakat Bilgileri
  interviews: {
    scheduledAt: Date; // Planlanan tarih
    interviewerId: mongoose.Types.ObjectId; // Mülakat yapan
    type: "phone" | "video" | "onsite"; // Mülakat türü
    status: "scheduled" | "completed" | "cancelled"; // Mülakat durumu
    notes?: string; // Mülakat notları
    rating?: number; // Mülakat puanı (1-5)
  }[];

  // Değerlendirme
  rating?: number; // Genel puan (1-5)
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
 * İş Başvurusu Şeması
 * MongoDB'de iş başvurusu verilerinin nasıl saklanacağını tanımlar
 */
const jobApplicationSchema = new Schema<IJobApplication>(
  {
    // Temel İlişkiler
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "İş ilanı seçimi zorunludur"],
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Başvuran kullanıcı zorunludur"],
    },

    // Başvuru Durumu
    status: {
      type: String,
      enum: {
        values: Object.values(ApplicationStatus),
        message: "Geçersiz başvuru durumu",
      },
      default: ApplicationStatus.PENDING,
    },

    // Başvuru İçeriği
    coverLetter: {
      type: String,
      required: [true, "Ön yazı zorunludur"],
      maxlength: [2000, "Ön yazı en fazla 2000 karakter olabilir"],
    },
    resume: {
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
      size: {
        type: Number,
        required: true,
        min: [0, "Dosya boyutu negatif olamaz"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Portföy
    portfolio: {
      url: {
        type: String,
        trim: true,
        maxlength: [500, "Portföy URL'i en fazla 500 karakter olabilir"],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [1000, "Portföy açıklaması en fazla 1000 karakter olabilir"],
      },
    },

    // Referanslar
    references: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Referans adı en fazla 100 karakter olabilir"],
        },
        position: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Pozisyon en fazla 100 karakter olabilir"],
        },
        company: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Şirket adı en fazla 100 karakter olabilir"],
        },
        email: {
          type: String,
          required: true,
          trim: true,
          match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Geçerli bir email adresi giriniz",
          ],
        },
        phone: {
          type: String,
          required: true,
          trim: true,
        },
        relationship: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "İlişki en fazla 100 karakter olabilir"],
        },
      },
    ],

    // Deneyim
    experience: [
      {
        company: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Şirket adı en fazla 100 karakter olabilir"],
        },
        position: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Pozisyon en fazla 100 karakter olabilir"],
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
          required: true,
          maxlength: [1000, "İş açıklaması en fazla 1000 karakter olabilir"],
        },
        achievements: [
          {
            type: String,
            trim: true,
            maxlength: [
              300,
              "Başarı açıklaması en fazla 300 karakter olabilir",
            ],
          },
        ],
      },
    ],

    // Eğitim
    education: [
      {
        institution: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, "Eğitim kurumu en fazla 200 karakter olabilir"],
        },
        degree: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Derece en fazla 100 karakter olabilir"],
        },
        field: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Alan en fazla 100 karakter olabilir"],
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        gpa: {
          type: Number,
          min: [0, "Not ortalaması negatif olamaz"],
          max: [4, "Not ortalaması en fazla 4 olabilir"],
        },
      },
    ],

    // Başvuru Detayları
    experienceLevel: {
      type: String,
      enum: {
        values: Object.values(ExperienceLevel),
        message: "Geçersiz deneyim seviyesi",
      },
      required: [true, "Deneyim seviyesi zorunludur"],
    },
    expectedSalary: {
      type: Number,
      min: [0, "Beklenen maaş negatif olamaz"],
    },
    currentEmployment: {
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
      noticePeriod: {
        type: Number,
        min: [0, "İstifa süresi negatif olamaz"],
        default: 30,
      },
    },

    // Yetenekler ve Sertifikalar
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Yetenek en fazla 100 karakter olabilir"],
      },
    ],
    certifications: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Sertifika adı en fazla 200 karakter olabilir"],
      },
    ],

    // Mülakat Bilgileri
    interviews: [
      {
        scheduledAt: {
          type: Date,
          required: true,
        },
        interviewerId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["phone", "video", "onsite"],
          required: true,
        },
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled"],
          default: "scheduled",
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [1000, "Mülakat notları en fazla 1000 karakter olabilir"],
        },
        rating: {
          type: Number,
          min: [1, "Mülakat puanı en az 1 olmalıdır"],
          max: [5, "Mülakat puanı en fazla 5 olmalıdır"],
        },
      },
    ],

    // Değerlendirme
    rating: {
      type: Number,
      min: [1, "Genel puan en az 1 olmalıdır"],
      max: [5, "Genel puan en fazla 5 olmalıdır"],
    },
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
jobApplicationSchema.index({ jobId: 1 }); // İş ilanına göre arama
jobApplicationSchema.index({ applicantId: 1 }); // Başvurana göre arama
jobApplicationSchema.index({ status: 1 }); // Duruma göre filtreleme
jobApplicationSchema.index({ experienceLevel: 1 }); // Deneyim seviyesine göre
jobApplicationSchema.index({ createdAt: -1 }); // Tarihe göre sıralama
jobApplicationSchema.index({ rating: -1 }); // Puana göre sıralama

// Compound index'ler - birden fazla alan için
jobApplicationSchema.index({ jobId: 1, status: 1 }); // İş ilanı ve durum
jobApplicationSchema.index({ applicantId: 1, status: 1 }); // Başvuran ve durum
jobApplicationSchema.index({ status: 1, createdAt: -1 }); // Durum ve tarih

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
jobApplicationSchema.virtual("isActive").get(function () {
  return [
    ApplicationStatus.PENDING,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.INTERVIEWED,
    ApplicationStatus.OFFER_MADE,
  ].includes(this.status);
});

jobApplicationSchema.virtual("isRejected").get(function () {
  return [ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN].includes(
    this.status
  );
});

jobApplicationSchema.virtual("isAccepted").get(function () {
  return this.status === ApplicationStatus.ACCEPTED;
});

jobApplicationSchema.virtual("hasInterviews").get(function () {
  return this.interviews && this.interviews.length > 0;
});

jobApplicationSchema.virtual("nextInterview").get(function () {
  if (!this.interviews || this.interviews.length === 0) return null;

  const upcomingInterviews = this.interviews.filter(
    (interview) =>
      interview.scheduledAt > new Date() && interview.status === "scheduled"
  );

  if (upcomingInterviews.length === 0) return null;

  return upcomingInterviews.sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  )[0];
});

jobApplicationSchema.virtual("totalExperienceYears").get(function () {
  if (!this.experience || this.experience.length === 0) return 0;

  let totalYears = 0;
  this.experience.forEach((exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const diffTime = end.getTime() - start.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += diffYears;
  });

  return Math.round(totalYears * 10) / 10; // 1 ondalık basamak
});

jobApplicationSchema.virtual("age").get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = now.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // gün cinsinden
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm iş başvuruları üzerinde işlem yapan metodlar
 */
jobApplicationSchema.statics.getPendingCount = function () {
  return this.countDocuments({ status: ApplicationStatus.PENDING });
};

jobApplicationSchema.statics.getApplicationsByJob = function (
  jobId: mongoose.Types.ObjectId
) {
  return this.find({ jobId }).populate("applicantId");
};

jobApplicationSchema.statics.getApplicationsByApplicant = function (
  applicantId: mongoose.Types.ObjectId
) {
  return this.find({ applicantId }).populate("jobId");
};

jobApplicationSchema.statics.getShortlistedApplications = function () {
  return this.find({ status: ApplicationStatus.SHORTLISTED });
};

jobApplicationSchema.statics.getApplicationsByStatus = function (
  status: ApplicationStatus
) {
  return this.find({ status });
};

jobApplicationSchema.statics.getAverageRating = function () {
  return this.aggregate([
    { $match: { rating: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir iş başvurusu üzerinde işlem yapan metodlar
 */
jobApplicationSchema.methods.scheduleInterview = function (
  scheduledAt: Date,
  interviewerId: mongoose.Types.ObjectId,
  type: "phone" | "video" | "onsite"
) {
  this["interviews"].push({
    scheduledAt,
    interviewerId,
    type,
    status: "scheduled",
  });
  this["status"] = ApplicationStatus.INTERVIEW_SCHEDULED;
  return this["save"]();
};

jobApplicationSchema.methods.completeInterview = function (
  interviewIndex: number,
  notes?: string,
  rating?: number
) {
  if (this["interviews"][interviewIndex]) {
    this["interviews"][interviewIndex].status = "completed";
    if (notes) this["interviews"][interviewIndex].notes = notes;
    if (rating) this["interviews"][interviewIndex].rating = rating;
  }
  this["status"] = ApplicationStatus.INTERVIEWED;
  return this["save"]();
};

jobApplicationSchema.methods.shortlist = function () {
  this["status"] = ApplicationStatus.SHORTLISTED;
  return this["save"]();
};

jobApplicationSchema.methods.reject = function (reason?: string) {
  this["status"] = ApplicationStatus.REJECTED;
  if (reason) {
    this["notes"].push({
      content: `Reddedilme nedeni: ${reason}`,
      author: new mongoose.Types.ObjectId(), // Sistem notu
      isPrivate: false,
      createdAt: new Date(),
    });
  }
  return this["save"]();
};

jobApplicationSchema.methods.accept = function () {
  this["status"] = ApplicationStatus.ACCEPTED;
  return this["save"]();
};

jobApplicationSchema.methods.withdraw = function () {
  this["status"] = ApplicationStatus.WITHDRAWN;
  return this["save"]();
};

jobApplicationSchema.methods.setRating = function (rating: number) {
  this["rating"] = rating;
  return this["save"]();
};

jobApplicationSchema.methods.addNote = function (
  content: string,
  author: mongoose.Types.ObjectId,
  isPrivate = false
) {
  this["notes"].push({
    content,
    author,
    isPrivate,
    createdAt: new Date(),
  });
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
jobApplicationSchema.pre("save", function (next) {
  // Deneyim tarihi kontrolü
  if (this["experience"]) {
    this["experience"].forEach((exp) => {
      if (exp.endDate && exp.startDate > exp.endDate) {
        return next(
          new Error("Deneyim başlangıç tarihi bitiş tarihinden sonra olamaz")
        );
      }
    });
  }

  // Eğitim tarihi kontrolü
  if (this["education"]) {
    this["education"].forEach((edu) => {
      if (edu.endDate && edu.startDate > edu.endDate) {
        return next(
          new Error("Eğitim başlangıç tarihi bitiş tarihinden sonra olamaz")
        );
      }
    });
  }

  // Mülakat tarihi kontrolü
  if (this["interviews"]) {
    this["interviews"].forEach((interview) => {
      if (interview.scheduledAt < new Date()) {
        return next(new Error("Mülakat tarihi geçmiş olamaz"));
      }
    });
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const JobApplication = mongoose.model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema
);
