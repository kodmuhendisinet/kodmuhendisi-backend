import mongoose, { Document, Schema } from "mongoose";

/**
 * İş İlanı Durumu Enum'u
 * İş ilanının yayın durumunu belirtir
 */
export enum JobStatus {
  DRAFT = "draft", // Taslak - Henüz yayınlanmamış
  PUBLISHED = "published", // Yayınlandı - Aktif ilan
  CLOSED = "closed", // Kapalı - İlan kapatıldı
  EXPIRED = "expired", // Süresi Doldu - Başvuru süresi bitti
  ARCHIVED = "archived", // Arşivlendi - Eski ilan
}

/**
 * İş Türü Enum'u
 * İşin çalışma şeklini belirtir
 */
export enum JobType {
  FULL_TIME = "full_time", // Tam Zamanlı - Tam zamanlı çalışma
  PART_TIME = "part_time", // Yarı Zamanlı - Yarı zamanlı çalışma
  CONTRACT = "contract", // Sözleşmeli - Belirli süreli sözleşme
  INTERNSHIP = "internship", // Staj - Staj programı
  FREELANCE = "freelance", // Serbest - Serbest çalışan
}

/**
 * Deneyim Seviyesi Enum'u
 * İş için gerekli deneyim seviyesini belirtir
 */
export enum ExperienceLevel {
  ENTRY = "entry", // Giriş Seviyesi - Deneyim gerekmez
  JUNIOR = "junior", // Junior - 1-3 yıl deneyim
  MID = "mid", // Orta Seviye - 3-5 yıl deneyim
  SENIOR = "senior", // Senior - 5-8 yıl deneyim
  LEAD = "lead", // Lead - 8+ yıl deneyim
  EXECUTIVE = "executive", // Yönetici - Yönetim pozisyonu
}

/**
 * İş İlanı Interface'i
 * Mongoose Document'ini extend ederek iş ilanı verilerinin tipini tanımlar
 */
export interface IJob extends Document {
  // Temel İş Bilgileri
  title: string; // İş başlığı
  department: string; // Departman
  description: string; // İş açıklaması

  // Gereksinimler ve Sorumluluklar
  requirements: string[]; // Gereksinimler
  responsibilities: string[]; // Sorumluluklar
  benefits: string[]; // Faydalar

  // İş Detayları
  jobType: JobType; // İş türü
  experienceLevel: ExperienceLevel; // Deneyim seviyesi
  status: JobStatus; // İlan durumu

  // Lokasyon Bilgileri
  location: string; // Lokasyon
  isRemote: boolean; // Uzaktan çalışma

  // Finansal Bilgiler
  salaryRange: {
    min: number; // Minimum maaş
    max: number; // Maksimum maaş
    currency: string; // Para birimi
  };

  // Zaman Bilgileri
  applicationDeadline: Date; // Başvuru son tarihi
  positions: number; // Alınacak kişi sayısı

  // Organizasyon
  skills: string[]; // Gerekli yetenekler
  tags: string[]; // İlan etiketleri

  // İlişkiler
  createdBy: mongoose.Types.ObjectId; // Oluşturan kullanıcı
  applications: mongoose.Types.ObjectId[]; // Başvurular

  // İstatistikler
  views: number; // Görüntülenme sayısı
  applicationsCount: number; // Başvuru sayısı

  // Öne Çıkarma
  isFeatured: boolean; // Öne çıkarıldı mı?
  featuredUntil?: Date; // Öne çıkarma bitiş tarihi

  // SEO Bilgileri
  seoData: {
    metaTitle?: string; // Meta başlık
    metaDescription?: string; // Meta açıklama
    keywords?: string[]; // Anahtar kelimeler
  };

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * İş İlanı Şeması
 * MongoDB'de iş ilanı verilerinin nasıl saklanacağını tanımlar
 */
const jobSchema = new Schema<IJob>(
  {
    // Temel Bilgiler
    title: {
      type: String,
      required: [true, "İş başlığı zorunludur"],
      trim: true,
      maxlength: [200, "Başlık en fazla 200 karakter olabilir"],
    },
    department: {
      type: String,
      required: [true, "Departman zorunludur"],
      trim: true,
      maxlength: [100, "Departman en fazla 100 karakter olabilir"],
    },
    description: {
      type: String,
      required: [true, "İş açıklaması zorunludur"],
      maxlength: [5000, "Açıklama en fazla 5000 karakter olabilir"],
    },

    // Gereksinimler ve Sorumluluklar
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Gereksinim en fazla 500 karakter olabilir"],
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Sorumluluk en fazla 500 karakter olabilir"],
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
        maxlength: [300, "Fayda en fazla 300 karakter olabilir"],
      },
    ],

    // İş Detayları
    jobType: {
      type: String,
      enum: {
        values: Object.values(JobType),
        message: "Geçersiz iş türü",
      },
      required: [true, "İş türü zorunludur"],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: Object.values(ExperienceLevel),
        message: "Geçersiz deneyim seviyesi",
      },
      required: [true, "Deneyim seviyesi zorunludur"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(JobStatus),
        message: "Geçersiz iş durumu",
      },
      default: JobStatus.DRAFT,
    },

    // Lokasyon Bilgileri
    location: {
      type: String,
      required: [true, "Lokasyon zorunludur"],
      trim: true,
      maxlength: [200, "Lokasyon en fazla 200 karakter olabilir"],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },

    // Finansal Bilgiler
    salaryRange: {
      min: {
        type: Number,
        required: [true, "Minimum maaş zorunludur"],
        min: [0, "Minimum maaş negatif olamaz"],
      },
      max: {
        type: Number,
        required: [true, "Maksimum maaş zorunludur"],
        min: [0, "Maksimum maaş negatif olamaz"],
        validate: {
          validator: function (this: IJob, value: number) {
            return value >= this.salaryRange.min;
          },
          message: "Maksimum maaş minimum maaştan küçük olamaz",
        },
      },
      currency: {
        type: String,
        default: "TRY",
        trim: true,
        maxlength: [10, "Para birimi en fazla 10 karakter olabilir"],
      },
    },

    // Zaman Bilgileri
    applicationDeadline: {
      type: Date,
      required: [true, "Başvuru son tarihi zorunludur"],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Başvuru son tarihi gelecekte olmalıdır",
      },
    },
    positions: {
      type: Number,
      required: [true, "Alınacak kişi sayısı zorunludur"],
      min: [1, "En az 1 kişi alınmalıdır"],
      default: 1,
    },

    // Organizasyon
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Yetenek en fazla 100 karakter olabilir"],
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Etiket en fazla 50 karakter olabilir"],
      },
    ],

    // İlişkiler
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Oluşturan kullanıcı zorunludur"],
    },
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "JobApplication",
      },
    ],

    // İstatistikler
    views: {
      type: Number,
      default: 0,
      min: [0, "Görüntülenme sayısı negatif olamaz"],
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: [0, "Başvuru sayısı negatif olamaz"],
    },

    // Öne Çıkarma
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },

    // SEO Bilgileri
    seoData: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, "Meta başlık en fazla 60 karakter olabilir"],
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, "Meta açıklama en fazla 160 karakter olabilir"],
      },
      keywords: [
        {
          type: String,
          trim: true,
          maxlength: [50, "Anahtar kelime en fazla 50 karakter olabilir"],
        },
      ],
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

/**
 * Veritabanı Index'leri
 * Sorgu performansını artırmak için oluşturulan index'ler
 */
jobSchema.index({ status: 1 }); // Duruma göre filtreleme
jobSchema.index({ department: 1 }); // Departmana göre filtreleme
jobSchema.index({ jobType: 1 }); // İş türüne göre filtreleme
jobSchema.index({ experienceLevel: 1 }); // Deneyim seviyesine göre
jobSchema.index({ location: 1 }); // Lokasyona göre arama
jobSchema.index({ isRemote: 1 }); // Uzaktan çalışma durumuna göre
jobSchema.index({ isFeatured: 1 }); // Öne çıkarma durumuna göre
jobSchema.index({ applicationDeadline: 1 }); // Başvuru son tarihine göre
jobSchema.index({ createdAt: -1 }); // Oluşturulma tarihine göre
jobSchema.index({ skills: 1 }); // Yeteneklere göre arama
jobSchema.index({ tags: 1 }); // Etiketlere göre arama

// Compound index'ler - birden fazla alan için
jobSchema.index({ status: 1, isFeatured: 1 }); // Durum ve öne çıkarma
jobSchema.index({ status: 1, applicationDeadline: 1 }); // Durum ve son tarih
jobSchema.index({ department: 1, status: 1 }); // Departman ve durum
jobSchema.index({ location: 1, isRemote: 1 }); // Lokasyon ve uzaktan çalışma

// Text search index - arama için
jobSchema.index({
  title: "text",
  description: "text",
  requirements: "text",
  responsibilities: "text",
  skills: "text",
  tags: "text",
});

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
jobSchema.virtual("isExpired").get(function () {
  return new Date() > this.applicationDeadline;
});

jobSchema.virtual("isActive").get(function () {
  return this.status === JobStatus.PUBLISHED && !this.isExpired;
});

jobSchema.virtual("isFeaturedActive").get(function () {
  if (!this.isFeatured) return false;
  if (!this.featuredUntil) return true;
  return new Date() < this.featuredUntil;
});

jobSchema.virtual("daysUntilDeadline").get(function () {
  const now = new Date();
  const deadline = this.applicationDeadline;
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

jobSchema.virtual("salaryDisplay").get(function () {
  const { min, max, currency } = this.salaryRange;
  if (min === max) {
    return `${min.toLocaleString()} ${currency}`;
  }
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
});

jobSchema.virtual("isUrgent").get(function () {
  return this.daysUntilDeadline <= 7 && this.status === JobStatus.PUBLISHED;
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm iş ilanları üzerinde işlem yapan metodlar
 */
jobSchema.statics.getActiveJobs = function () {
  return this.find({
    status: JobStatus.PUBLISHED,
    applicationDeadline: { $gt: new Date() },
  });
};

jobSchema.statics.getFeaturedJobs = function () {
  return this.find({
    status: JobStatus.PUBLISHED,
    applicationDeadline: { $gt: new Date() },
    isFeatured: true,
    $or: [
      { featuredUntil: { $exists: false } },
      { featuredUntil: { $gt: new Date() } },
    ],
  });
};

jobSchema.statics.getJobsByDepartment = function (department: string) {
  return this.find({
    status: JobStatus.PUBLISHED,
    applicationDeadline: { $gt: new Date() },
    department: { $regex: department, $options: "i" },
  });
};

jobSchema.statics.searchJobs = function (query: string) {
  return this.find(
    {
      $text: { $search: query },
      status: JobStatus.PUBLISHED,
      applicationDeadline: { $gt: new Date() },
    },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

jobSchema.statics.getJobStats = function () {
  return this.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

jobSchema.statics.getExpiredJobs = function () {
  return this.find({
    applicationDeadline: { $lt: new Date() },
    status: JobStatus.PUBLISHED,
  });
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir iş ilanı üzerinde işlem yapan metodlar
 */
jobSchema.methods.publish = function () {
  this["status"] = JobStatus.PUBLISHED;
  return this["save"]();
};

jobSchema.methods.close = function () {
  this["status"] = JobStatus.CLOSED;
  return this["save"]();
};

jobSchema.methods.archive = function () {
  this["status"] = JobStatus.ARCHIVED;
  return this["save"]();
};

jobSchema.methods.feature = function (days: number = 30) {
  this["isFeatured"] = true;
  this["featuredUntil"] = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this["save"]();
};

jobSchema.methods.unfeature = function () {
  this["isFeatured"] = false;
  this["featuredUntil"] = undefined;
  return this["save"]();
};

jobSchema.methods.incrementViews = function () {
  this["views"] += 1;
  return this["save"]();
};

jobSchema.methods.incrementApplications = function () {
  this["applicationsCount"] += 1;
  return this["save"]();
};

jobSchema.methods.addApplication = function (
  applicationId: mongoose.Types.ObjectId
) {
  this["applications"].push(applicationId);
  this["applicationsCount"] = this["applications"].length;
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
jobSchema.pre("save", function (next) {
  // Başvuru son tarihi kontrolü
  if (this["applicationDeadline"] && this["applicationDeadline"] < new Date()) {
    this["status"] = JobStatus.EXPIRED;
  }

  // Başvuru sayısı senkronizasyonu
  if (this["applications"]) {
    this["applicationsCount"] = this["applications"].length;
  }

  // Öne çıkarma süresi kontrolü
  if (this["featuredUntil"] && this["featuredUntil"] < new Date()) {
    this["isFeatured"] = false;
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Job = mongoose.model<IJob>("Job", jobSchema);
