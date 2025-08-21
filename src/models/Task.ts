import mongoose, { Document, Schema } from "mongoose";

/**
 * Görev Durumu Enum'u
 * Görevin yaşam döngüsündeki farklı aşamalarını tanımlar
 */
export enum TaskStatus {
  TODO = "todo", // Yapılacak - Henüz başlanmadı
  IN_PROGRESS = "in_progress", // Devam Ediyor - Aktif çalışma
  REVIEW = "review", // İnceleme - Kontrol ediliyor
  TESTING = "testing", // Test - Test aşamasında
  COMPLETED = "completed", // Tamamlandı - Görev bitti
  CANCELLED = "cancelled", // İptal Edildi - Görev iptal
}

/**
 * Görev Önceliği Enum'u
 * Görevin aciliyet seviyesini belirtir
 */
export enum TaskPriority {
  LOW = "low", // Düşük - Normal öncelik
  MEDIUM = "medium", // Orta - Standart öncelik
  HIGH = "high", // Yüksek - Acil
  URGENT = "urgent", // Acil - En yüksek öncelik
}

/**
 * Görev Interface'i
 * Mongoose Document'ini extend ederek görev verilerinin tipini tanımlar
 */
export interface ITask extends Document {
  // Temel Görev Bilgileri
  title: string; // Görev başlığı
  description: string; // Görev açıklaması
  projectId: mongoose.Types.ObjectId; // Proje referansı
  assignedTo: mongoose.Types.ObjectId[]; // Atanan kullanıcılar

  // Görev Detayları
  status: TaskStatus; // Görev durumu
  priority: TaskPriority; // Görev önceliği
  dueDate: Date; // Son tarih

  // Zaman Takibi
  estimatedHours: number; // Tahmini süre (saat)
  actualHours: number; // Gerçekleşen süre (saat)

  // Organizasyon
  dependencies: mongoose.Types.ObjectId[]; // Bağımlı görevler
  tags: string[]; // Görev etiketleri

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

  // İletişim ve Yorumlar
  comments: {
    content: string; // Yorum içeriği
    author: mongoose.Types.ObjectId; // Yazan kullanıcı
    createdAt: Date; // Oluşturulma tarihi
    updatedAt: Date; // Güncellenme tarihi
  }[];

  // Zaman Kayıtları
  timeLogs: {
    userId: mongoose.Types.ObjectId; // Çalışan kullanıcı
    startTime: Date; // Başlangıç zamanı
    endTime?: Date; // Bitiş zamanı (opsiyonel)
    duration?: number; // Süre (dakika cinsinden)
    description: string; // Çalışma açıklaması
  }[];

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Görev Şeması
 * MongoDB'de görev verilerinin nasıl saklanacağını tanımlar
 */
const taskSchema = new Schema<ITask>(
  {
    // Temel Bilgiler
    title: {
      type: String,
      required: [true, "Görev başlığı zorunludur"],
      trim: true,
      maxlength: [200, "Görev başlığı en fazla 200 karakter olabilir"],
    },
    description: {
      type: String,
      required: [true, "Görev açıklaması zorunludur"],
      maxlength: [2000, "Açıklama en fazla 2000 karakter olabilir"],
    },

    // İlişkiler
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Proje seçimi zorunludur"],
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Görev Özellikleri
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: "Geçersiz görev durumu",
      },
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TaskPriority),
        message: "Geçersiz görev önceliği",
      },
      default: TaskPriority.MEDIUM,
    },

    // Zaman Bilgileri
    dueDate: {
      type: Date,
      required: [true, "Son tarih zorunludur"],
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, "Tahmini süre negatif olamaz"],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, "Gerçekleşen süre negatif olamaz"],
    },

    // Organizasyon
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Etiket en fazla 50 karakter olabilir"],
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

    // Yorumlar
    comments: [
      {
        content: {
          type: String,
          required: true,
          maxlength: [2000, "Yorum içeriği en fazla 2000 karakter olabilir"],
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

    // Zaman Kayıtları
    timeLogs: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
        },
        duration: {
          type: Number,
          min: [0, "Süre negatif olamaz"],
        },
        description: {
          type: String,
          required: true,
          maxlength: [500, "Açıklama en fazla 500 karakter olabilir"],
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
taskSchema.index({ projectId: 1 }); // Projeye göre arama
taskSchema.index({ assignedTo: 1 }); // Atanan kullanıcıya göre
taskSchema.index({ status: 1 }); // Duruma göre filtreleme
taskSchema.index({ priority: 1 }); // Önceliğe göre filtreleme
taskSchema.index({ dueDate: 1 }); // Son tarihe göre sıralama
taskSchema.index({ dependencies: 1 }); // Bağımlılıklara göre
taskSchema.index({ tags: 1 }); // Etiketlere göre arama

// Compound index'ler - birden fazla alan için
taskSchema.index({ projectId: 1, status: 1 }); // Proje ve durum
taskSchema.index({ assignedTo: 1, status: 1 }); // Atanan ve durum
taskSchema.index({ status: 1, priority: 1 }); // Durum ve öncelik
taskSchema.index({ dueDate: 1, status: 1 }); // Son tarih ve durum

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
taskSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== TaskStatus.COMPLETED &&
    this.status !== TaskStatus.CANCELLED &&
    new Date() > this.dueDate
  );
});

taskSchema.virtual("progress").get(function () {
  // Duruma göre ilerleme yüzdesi
  const statusProgress = {
    [TaskStatus.TODO]: 0,
    [TaskStatus.IN_PROGRESS]: 25,
    [TaskStatus.REVIEW]: 50,
    [TaskStatus.TESTING]: 75,
    [TaskStatus.COMPLETED]: 100,
    [TaskStatus.CANCELLED]: 0,
  };
  return statusProgress[this.status] || 0;
});

taskSchema.virtual("totalTimeSpent").get(function () {
  // Toplam harcanan süreyi hesapla (dakika cinsinden)
  return this.timeLogs.reduce((total, log) => {
    if (log.duration) {
      return total + log.duration;
    }
    if (log.endTime) {
      const duration =
        (log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60); // dakika
      return total + duration;
    }
    return total;
  }, 0);
});

taskSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const due = this.dueDate;
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

taskSchema.virtual("isUrgent").get(function () {
  return (
    this.priority === TaskPriority.URGENT ||
    (this.daysRemaining <= 1 && this.status !== TaskStatus.COMPLETED)
  );
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm görevler üzerinde işlem yapan metodlar
 */
taskSchema.statics.getTasksByProject = function (
  projectId: mongoose.Types.ObjectId
) {
  return this.find({ projectId }).populate("assignedTo");
};

taskSchema.statics.getOverdueTasks = function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
  });
};

taskSchema.statics.getTasksByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ assignedTo: userId }).populate("projectId");
};

taskSchema.statics.getTaskStats = function () {
  return this.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir görev üzerinde işlem yapan metodlar
 */
taskSchema.methods.startTask = function () {
  this["status"] = TaskStatus.IN_PROGRESS;
  return this["save"]();
};

taskSchema.methods.completeTask = function () {
  this["status"] = TaskStatus.COMPLETED;
  return this["save"]();
};

taskSchema.methods.assignTo = function (userId: mongoose.Types.ObjectId) {
  if (!this["assignedTo"].includes(userId)) {
    this["assignedTo"].push(userId);
  }
  return this["save"]();
};

taskSchema.methods.removeAssignment = function (
  userId: mongoose.Types.ObjectId
) {
  this["assignedTo"] = this["assignedTo"].filter((id) => !id.equals(userId));
  return this["save"]();
};

taskSchema.methods.addComment = function (
  content: string,
  authorId: mongoose.Types.ObjectId
) {
  this["comments"].push({
    content,
    author: authorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return this["save"]();
};

taskSchema.methods.startTimeLog = function (
  userId: mongoose.Types.ObjectId,
  description: string
) {
  this["timeLogs"].push({
    userId,
    startTime: new Date(),
    description,
  });
  return this["save"]();
};

taskSchema.methods.stopTimeLog = function (timeLogIndex: number) {
  if (
    this["timeLogs"][timeLogIndex] &&
    !this["timeLogs"][timeLogIndex].endTime
  ) {
    this["timeLogs"][timeLogIndex].endTime = new Date();
    const startTime = this["timeLogs"][timeLogIndex].startTime;
    const endTime = this["timeLogs"][timeLogIndex].endTime;
    this["timeLogs"][timeLogIndex].duration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60); // dakika
  }
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
taskSchema.pre("save", function (next) {
  // Gerçekleşen süreyi timeLogs'dan hesapla
  this["actualHours"] = this["totalTimeSpent"] / 60; // saat cinsinden

  // Son tarih kontrolü
  if (this["dueDate"] < new Date() && this["status"] !== TaskStatus.COMPLETED) {
    // Gecikmiş görevler için uyarı
    console.warn(`Görev ${this["title"]} gecikmiş!`);
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Task = mongoose.model<ITask>("Task", taskSchema);
