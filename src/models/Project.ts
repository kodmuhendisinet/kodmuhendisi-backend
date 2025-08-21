import mongoose, { Document, Schema, Model } from "mongoose";

/**
 * Proje Durumu Enum'u
 * Projenin yaşam döngüsündeki farklı aşamalarını tanımlar
 */
export enum ProjectStatus {
  PLANNING = "planning", // Planlama - Proje planlanıyor
  IN_PROGRESS = "in_progress", // Devam Ediyor - Aktif geliştirme
  REVIEW = "review", // İnceleme - Müşteri incelemesi
  ON_HOLD = "on_hold", // Beklemede - Geçici durdurma
  COMPLETED = "completed", // Tamamlandı - Proje bitti
  CANCELLED = "cancelled", // İptal Edildi - Proje iptal
}

/**
 * Proje Kategorisi Enum'u
 * Projenin hangi hizmet kategorisinde olduğunu belirtir
 */
export enum ProjectCategory {
  WEB_DESIGN = "web_design", // Web Tasarımı
  E_COMMERCE = "e_commerce", // E-Ticaret
  DIGITAL_MARKETING = "digital_marketing", // Dijital Pazarlama
  MOBILE_APP = "mobile_app", // Mobil Uygulama
  SEO = "seo", // SEO Optimizasyonu
  GRAPHIC_DESIGN = "graphic_design", // Grafik Tasarım
  CRM_SYSTEM = "crm_system", // CRM Sistemi
}

/**
 * Proje Önceliği Enum'u
 * Projenin aciliyet seviyesini belirtir
 */
export enum ProjectPriority {
  LOW = "low", // Düşük - Normal öncelik
  MEDIUM = "medium", // Orta - Standart öncelik
  HIGH = "high", // Yüksek - Acil
  URGENT = "urgent", // Acil - En yüksek öncelik
}

/**
 * Proje Instance Metodları Interface'i
 * Tek bir proje üzerinde işlem yapan metodların tiplerini tanımlar
 */
export interface IProjectMethods {
  startProject(): Promise<IProject>;
  completeProject(): Promise<IProject>;
  addTeamMember(userId: mongoose.Types.ObjectId): Promise<IProject>;
  removeTeamMember(userId: mongoose.Types.ObjectId): Promise<IProject>;
  addMilestone(
    title: string,
    description: string,
    dueDate: Date
  ): Promise<IProject>;
  completeMilestone(milestoneIndex: number): Promise<IProject>;
}

/**
 * Proje Static Metodları Interface'i
 * Model seviyesinde işlem yapan metodların tiplerini tanımlar
 */
export interface IProjectStatics {
  getActiveProjects(): mongoose.Query<IProject[], IProject>;
  getOverdueProjects(): mongoose.Query<IProject[], IProject>;
  getProjectsByClient(
    clientId: mongoose.Types.ObjectId
  ): mongoose.Query<IProject[], IProject>;
  getProjectStats(): mongoose.Aggregate<any[]>;
}

/**
 * Proje Interface'i
 * Mongoose Document'ini extend ederek proje verilerinin tipini tanımlar
 */
export interface IProject extends Document, IProjectMethods {
  // Temel Proje Bilgileri
  name: string; // Proje adı
  description: string; // Proje açıklaması
  clientId: mongoose.Types.ObjectId; // Müşteri referansı
  projectManagerId: mongoose.Types.ObjectId; // Proje yöneticisi

  // Proje Detayları
  category: ProjectCategory; // Proje kategorisi
  status: ProjectStatus; // Proje durumu
  priority: ProjectPriority; // Proje önceliği

  // Zaman Bilgileri
  startDate: Date; // Başlangıç tarihi
  endDate: Date; // Bitiş tarihi

  // Finansal Bilgiler
  budget: number; // Toplam bütçe
  spent: number; // Harcanan miktar
  progress: number; // İlerleme yüzdesi (0-100)

  // Organizasyon
  tags: string[]; // Proje etiketleri
  team: mongoose.Types.ObjectId[]; // Proje ekibi

  // Dosya Yönetimi
  attachments: {
    filename: string; // Dosya adı
    originalName: string; // Orijinal dosya adı
    url: string; // Dosya URL'i
    size: number; // Dosya boyutu (byte)
    mimeType: string; // Dosya türü
    uploadedBy: mongoose.Types.ObjectId; // Yükleyen kullanıcı
    uploadedAt: Date; // Yükleme tarihi
  }[];

  // Proje Yönetimi
  milestones: {
    title: string; // Kilometre taşı başlığı
    description: string; // Açıklama
    dueDate: Date; // Son tarih
    completed: boolean; // Tamamlandı mı?
    completedAt?: Date; // Tamamlanma tarihi
  }[];

  // Gereksinimler
  requirements: {
    title: string; // Gereksinim başlığı
    description: string; // Detay açıklama
    priority: "low" | "medium" | "high"; // Gereksinim önceliği
    completed: boolean; // Tamamlandı mı?
  }[];

  // Notlar ve Yorumlar
  notes: {
    content: string; // Not içeriği
    author: mongoose.Types.ObjectId; // Yazan kullanıcı
    createdAt: Date; // Oluşturulma tarihi
    updatedAt: Date; // Güncellenme tarihi
  }[];

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Proje Model Interface'i
 * Mongoose Model'ini extend ederek static metodları tanımlar
 */
export interface IProjectModel
  extends Model<IProject, {}, IProjectMethods>,
    IProjectStatics {}

/**
 * Proje Şeması
 * MongoDB'de proje verilerinin nasıl saklanacağını tanımlar
 */
const projectSchema = new Schema<IProject, IProjectModel>(
  {
    // Temel Bilgiler
    name: {
      type: String,
      required: [true, "Proje adı zorunludur"],
      trim: true,
      maxlength: [200, "Proje adı en fazla 200 karakter olabilir"],
    },
    description: {
      type: String,
      required: [true, "Proje açıklaması zorunludur"],
      maxlength: [2000, "Açıklama en fazla 2000 karakter olabilir"],
    },

    // İlişkiler
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Müşteri seçimi zorunludur"],
    },
    projectManagerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Proje yöneticisi seçimi zorunludur"],
    },

    // Proje Özellikleri
    category: {
      type: String,
      enum: {
        values: Object.values(ProjectCategory),
        message: "Geçersiz proje kategorisi",
      },
      required: [true, "Proje kategorisi zorunludur"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ProjectStatus),
        message: "Geçersiz proje durumu",
      },
      default: ProjectStatus.PLANNING,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(ProjectPriority),
        message: "Geçersiz proje önceliği",
      },
      default: ProjectPriority.MEDIUM,
    },

    // Zaman Bilgileri
    startDate: {
      type: Date,
      required: [true, "Başlangıç tarihi zorunludur"],
    },
    endDate: {
      type: Date,
      required: [true, "Bitiş tarihi zorunludur"],
      validate: {
        validator: function (this: IProject, value: Date) {
          return value > this.startDate;
        },
        message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      },
    },

    // Finansal Bilgiler
    budget: {
      type: Number,
      required: [true, "Proje bütçesi zorunludur"],
      min: [0, "Bütçe negatif olamaz"],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, "Harcanan miktar negatif olamaz"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "İlerleme en az 0 olmalıdır"],
      max: [100, "İlerleme en fazla 100 olmalıdır"],
    },

    // Organizasyon
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Etiket en fazla 50 karakter olabilir"],
      },
    ],
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Dosya Yönetimi
    attachments: [
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
        size: {
          type: Number,
          required: true,
          min: [0, "Dosya boyutu negatif olamaz"],
        },
        mimeType: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Kilometre Taşları
    milestones: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            200,
            "Kilometre taşı başlığı en fazla 200 karakter olabilir",
          ],
        },
        description: {
          type: String,
          maxlength: [1000, "Açıklama en fazla 1000 karakter olabilir"],
        },
        dueDate: {
          type: Date,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],

    // Gereksinimler
    requirements: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, "Gereksinim başlığı en fazla 200 karakter olabilir"],
        },
        description: {
          type: String,
          maxlength: [1000, "Açıklama en fazla 1000 karakter olabilir"],
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        completed: {
          type: Boolean,
          default: false,
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
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
projectSchema.index({ clientId: 1 }); // Müşteriye göre arama
projectSchema.index({ projectManagerId: 1 }); // Yöneticiye göre arama
projectSchema.index({ status: 1 }); // Duruma göre filtreleme
projectSchema.index({ category: 1 }); // Kategoriye göre filtreleme
projectSchema.index({ priority: 1 }); // Önceliğe göre filtreleme
projectSchema.index({ startDate: 1 }); // Başlangıç tarihine göre
projectSchema.index({ endDate: 1 }); // Bitiş tarihine göre
projectSchema.index({ tags: 1 }); // Etiketlere göre arama

// Compound index'ler - birden fazla alan için
projectSchema.index({ status: 1, priority: 1 }); // Durum ve öncelik
projectSchema.index({ clientId: 1, status: 1 }); // Müşteri ve durum
projectSchema.index({ category: 1, status: 1 }); // Kategori ve durum
projectSchema.index({ startDate: 1, endDate: 1 }); // Tarih aralığı

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
projectSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== ProjectStatus.COMPLETED &&
    this.status !== ProjectStatus.CANCELLED &&
    new Date() > this.endDate
  );
});

projectSchema.virtual("budgetUtilization").get(function () {
  return this.budget > 0 ? (this.spent / this.budget) * 100 : 0;
});

projectSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const end = this.endDate;
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

projectSchema.virtual("isActive").get(function () {
  return (
    this.status === ProjectStatus.IN_PROGRESS ||
    this.status === ProjectStatus.REVIEW
  );
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm projeler üzerinde işlem yapan metodlar
 */
projectSchema.statics["getActiveProjects"] = function () {
  return this["find"]({
    status: { $in: [ProjectStatus.IN_PROGRESS, ProjectStatus.REVIEW] },
  });
};

projectSchema.statics["getOverdueProjects"] = function () {
  return this["find"]({
    endDate: { $lt: new Date() },
    status: { $nin: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
  });
};

projectSchema.statics["getProjectsByClient"] = function (
  clientId: mongoose.Types.ObjectId
) {
  return this["find"]({ clientId }).populate("projectManagerId");
};

projectSchema.statics["getProjectStats"] = function () {
  return this["aggregate"]([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir proje üzerinde işlem yapan metodlar
 */
projectSchema.methods.startProject = function () {
  this["status"] = ProjectStatus.IN_PROGRESS;
  return this["save"]();
};

projectSchema.methods.completeProject = function () {
  this["status"] = ProjectStatus.COMPLETED;
  this["progress"] = 100;
  return this["save"]();
};

projectSchema.methods.addTeamMember = function (
  userId: mongoose.Types.ObjectId
) {
  if (!this["team"].includes(userId)) {
    this["team"].push(userId);
  }
  return this["save"]();
};

projectSchema.methods.removeTeamMember = function (
  userId: mongoose.Types.ObjectId
) {
  this["team"] = this["team"].filter((id) => !id.equals(userId));
  return this["save"]();
};

projectSchema.methods.addMilestone = function (
  title: string,
  description: string,
  dueDate: Date
) {
  this["milestones"].push({
    title,
    description,
    dueDate,
    completed: false,
  });
  return this["save"]();
};

projectSchema.methods.completeMilestone = function (milestoneIndex: number) {
  if (this["milestones"][milestoneIndex]) {
    this["milestones"][milestoneIndex].completed = true;
    this["milestones"][milestoneIndex].completedAt = new Date();
  }
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
projectSchema.pre("save", function (next) {
  // İlerleme yüzdesini kilometre taşlarından hesapla
  if (this["milestones"].length > 0) {
    const completedMilestones = this["milestones"].filter(
      (m) => m.completed
    ).length;
    this["progress"] = Math.round(
      (completedMilestones / this["milestones"].length) * 100
    );
  }

  // Bütçe kontrolü
  if (this["spent"] > this["budget"]) {
    // Bütçe aşımı durumunda uyarı (ama kaydetmeye devam et)
    console.warn(`Proje ${this["name"]} bütçe aşımında!`);
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Project = mongoose.model<IProject, IProjectModel>(
  "Project",
  projectSchema
);
