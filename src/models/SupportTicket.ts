import mongoose, { Document, Schema } from "mongoose";

/**
 * Destek Talebi Durumu Enum'u
 * Destek talebinin yaşam döngüsündeki farklı aşamalarını tanımlar
 */
export enum TicketStatus {
  OPEN = "open", // Açık - Yeni talep
  IN_PROGRESS = "in_progress", // İşlemde - Çözüm sürecinde
  WAITING_FOR_CUSTOMER = "waiting_for_customer", // Müşteri Bekliyor - Yanıt bekleniyor
  RESOLVED = "resolved", // Çözüldü - Sorun çözüldü
  CLOSED = "closed", // Kapalı - Talep kapatıldı
  CANCELLED = "cancelled", // İptal Edildi - Talep iptal
}

/**
 * Destek Talebi Önceliği Enum'u
 * Talebin aciliyet seviyesini belirtir
 */
export enum TicketPriority {
  LOW = "low", // Düşük - Normal öncelik
  MEDIUM = "medium", // Orta - Standart öncelik
  HIGH = "high", // Yüksek - Acil
  URGENT = "urgent", // Acil - En yüksek öncelik
}

/**
 * Destek Talebi Kategorisi Enum'u
 * Talebin hangi konu başlığında olduğunu belirtir
 */
export enum TicketCategory {
  TECHNICAL = "technical", // Teknik - Teknik sorunlar
  BILLING = "billing", // Faturalama - Ödeme sorunları
  FEATURE_REQUEST = "feature_request", // Özellik Talebi - Yeni özellik istekleri
  BUG_REPORT = "bug_report", // Hata Bildirimi - Sistem hataları
  GENERAL = "general", // Genel - Genel sorular
  ACCOUNT = "account", // Hesap - Hesap sorunları
}

/**
 * Destek Talebi Kanalı Enum'u
 * Talebin hangi kanaldan geldiğini belirtir
 */
export enum TicketChannel {
  EMAIL = "email", // Email - Email ile
  PHONE = "phone", // Telefon - Telefon ile
  CHAT = "chat", // Canlı Destek - Chat ile
  WEB_FORM = "web_form", // Web Formu - Web sitesi formu
  SOCIAL_MEDIA = "social_media", // Sosyal Medya - Sosyal medya
}

/**
 * Destek Talebi Interface'i
 * Mongoose Document'ini extend ederek destek talebi verilerinin tipini tanımlar
 */
export interface ISupportTicket extends Document {
  // Temel Talep Bilgileri
  title: string; // Talep başlığı
  description: string; // Talep açıklaması
  customerId: mongoose.Types.ObjectId; // Müşteri referansı
  assignedTo?: mongoose.Types.ObjectId; // Atanan temsilci (opsiyonel)

  // Talep Özellikleri
  status: TicketStatus; // Talep durumu
  priority: TicketPriority; // Talep önceliği
  category: TicketCategory; // Talep kategorisi
  channel: TicketChannel; // Talep kanalı

  // Performans Metrikleri
  responseTime?: number; // Yanıt süresi (dakika)
  resolutionTime?: number; // Çözüm süresi (dakika)
  satisfactionRating?: number; // Memnuniyet puanı (1-5)
  satisfactionComment?: string; // Memnuniyet yorumu

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

  // Konuşma Geçmişi
  conversations: {
    message: string; // Mesaj içeriği
    senderId: mongoose.Types.ObjectId; // Gönderen kullanıcı
    senderType: "customer" | "agent" | "system"; // Gönderen tipi
    isInternal: boolean; // İç mesaj mı?
    createdAt: Date; // Oluşturulma tarihi
  }[];

  // Organizasyon
  tags: string[]; // Talep etiketleri
  dueDate?: Date; // Son tarih (opsiyonel)

  // Eskalasyon Bilgileri
  escalatedAt?: Date; // Eskalasyon tarihi
  escalatedBy?: mongoose.Types.ObjectId; // Eskalasyon yapan
  escalatedTo?: mongoose.Types.ObjectId; // Eskalasyon edilen

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Destek Talebi Şeması
 * MongoDB'de destek talebi verilerinin nasıl saklanacağını tanımlar
 */
const supportTicketSchema = new Schema<ISupportTicket>(
  {
    // Temel Bilgiler
    title: {
      type: String,
      required: [true, "Talep başlığı zorunludur"],
      trim: true,
      maxlength: [200, "Başlık en fazla 200 karakter olabilir"],
    },
    description: {
      type: String,
      required: [true, "Talep açıklaması zorunludur"],
      maxlength: [2000, "Açıklama en fazla 2000 karakter olabilir"],
    },

    // İlişkiler
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Müşteri seçimi zorunludur"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Talep Özellikleri
    status: {
      type: String,
      enum: {
        values: Object.values(TicketStatus),
        message: "Geçersiz talep durumu",
      },
      default: TicketStatus.OPEN,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TicketPriority),
        message: "Geçersiz talep önceliği",
      },
      default: TicketPriority.MEDIUM,
    },
    category: {
      type: String,
      enum: {
        values: Object.values(TicketCategory),
        message: "Geçersiz talep kategorisi",
      },
      required: [true, "Talep kategorisi zorunludur"],
    },
    channel: {
      type: String,
      enum: {
        values: Object.values(TicketChannel),
        message: "Geçersiz talep kanalı",
      },
      required: [true, "Talep kanalı zorunludur"],
    },

    // Performans Metrikleri
    responseTime: {
      type: Number,
      min: [0, "Yanıt süresi negatif olamaz"],
    },
    resolutionTime: {
      type: Number,
      min: [0, "Çözüm süresi negatif olamaz"],
    },
    satisfactionRating: {
      type: Number,
      min: [1, "Memnuniyet puanı en az 1 olmalıdır"],
      max: [5, "Memnuniyet puanı en fazla 5 olmalıdır"],
    },
    satisfactionComment: {
      type: String,
      trim: true,
      maxlength: [1000, "Memnuniyet yorumu en fazla 1000 karakter olabilir"],
    },

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

    // Konuşma Geçmişi
    conversations: [
      {
        message: {
          type: String,
          required: true,
          maxlength: [2000, "Mesaj en fazla 2000 karakter olabilir"],
        },
        senderId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        senderType: {
          type: String,
          enum: ["customer", "agent", "system"],
          required: true,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Organizasyon
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Etiket en fazla 50 karakter olabilir"],
      },
    ],
    dueDate: {
      type: Date,
    },

    // Eskalasyon Bilgileri
    escalatedAt: {
      type: Date,
    },
    escalatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    escalatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
supportTicketSchema.index({ customerId: 1 }); // Müşteriye göre arama
supportTicketSchema.index({ assignedTo: 1 }); // Atanan temsilciye göre
supportTicketSchema.index({ status: 1 }); // Duruma göre filtreleme
supportTicketSchema.index({ priority: 1 }); // Önceliğe göre filtreleme
supportTicketSchema.index({ category: 1 }); // Kategoriye göre filtreleme
supportTicketSchema.index({ channel: 1 }); // Kanala göre filtreleme
supportTicketSchema.index({ createdAt: -1 }); // Tarihe göre sıralama
supportTicketSchema.index({ dueDate: 1 }); // Son tarihe göre
supportTicketSchema.index({ tags: 1 }); // Etiketlere göre arama

// Compound index'ler - birden fazla alan için
supportTicketSchema.index({ status: 1, priority: 1 }); // Durum ve öncelik
supportTicketSchema.index({ assignedTo: 1, status: 1 }); // Atanan ve durum
supportTicketSchema.index({ customerId: 1, status: 1 }); // Müşteri ve durum
supportTicketSchema.index({ category: 1, status: 1 }); // Kategori ve durum

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
supportTicketSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  return (
    this.status !== TicketStatus.RESOLVED &&
    this.status !== TicketStatus.CLOSED &&
    this.status !== TicketStatus.CANCELLED &&
    new Date() > this.dueDate
  );
});

supportTicketSchema.virtual("isUrgent").get(function () {
  return this.priority === TicketPriority.URGENT;
});

supportTicketSchema.virtual("isHighPriority").get(function () {
  return (
    this.priority === TicketPriority.HIGH ||
    this.priority === TicketPriority.URGENT
  );
});

supportTicketSchema.virtual("age").get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  ); // gün cinsinden
});

supportTicketSchema.virtual("isEscalated").get(function () {
  return !!this.escalatedAt;
});

supportTicketSchema.virtual("isActive").get(function () {
  return (
    this.status === TicketStatus.OPEN ||
    this.status === TicketStatus.IN_PROGRESS ||
    this.status === TicketStatus.WAITING_FOR_CUSTOMER
  );
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm destek talepleri üzerinde işlem yapan metodlar
 */
supportTicketSchema.statics.getOpenTicketsCount = function () {
  return this.countDocuments({
    status: { $in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
  });
};

supportTicketSchema.statics.getOverdueTicketsCount = function () {
  return this.countDocuments({
    dueDate: { $lt: new Date() },
    status: {
      $nin: [
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
        TicketStatus.CANCELLED,
      ],
    },
  });
};

supportTicketSchema.statics.getAverageResponseTime = function () {
  return this.aggregate([
    { $match: { responseTime: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgResponseTime: { $avg: "$responseTime" } } },
  ]);
};

supportTicketSchema.statics.getTicketsByCustomer = function (
  customerId: mongoose.Types.ObjectId
) {
  return this.find({ customerId }).populate("assignedTo");
};

supportTicketSchema.statics.getTicketsByAgent = function (
  agentId: mongoose.Types.ObjectId
) {
  return this.find({ assignedTo: agentId });
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir destek talebi üzerinde işlem yapan metodlar
 */
supportTicketSchema.methods.assignTo = function (
  agentId: mongoose.Types.ObjectId
) {
  this["assignedTo"] = agentId;
  this["status"] = TicketStatus.IN_PROGRESS;
  return this["save"]();
};

supportTicketSchema.methods.escalate = function (
  escalatedTo: mongoose.Types.ObjectId,
  escalatedBy: mongoose.Types.ObjectId
) {
  this["escalatedTo"] = escalatedTo;
  this["escalatedBy"] = escalatedBy;
  this["escalatedAt"] = new Date();
  this["priority"] = TicketPriority.HIGH;
  return this["save"]();
};

supportTicketSchema.methods.addConversation = function (
  message: string,
  senderId: mongoose.Types.ObjectId,
  senderType: "customer" | "agent" | "system",
  isInternal = false
) {
  this["conversations"].push({
    message,
    senderId,
    senderType,
    isInternal,
    createdAt: new Date(),
  });
  return this["save"]();
};

supportTicketSchema.methods.resolve = function () {
  this["status"] = TicketStatus.RESOLVED;
  if (this["createdAt"]) {
    this["resolutionTime"] = Math.floor(
      (Date.now() - this["createdAt"].getTime()) / (1000 * 60)
    ); // dakika
  }
  return this["save"]();
};

supportTicketSchema.methods.close = function () {
  this["status"] = TicketStatus.CLOSED;
  return this["save"]();
};

supportTicketSchema.methods.reopen = function () {
  this["status"] = TicketStatus.OPEN;
  return this["save"]();
};

supportTicketSchema.methods.setSatisfaction = function (
  rating: number,
  comment?: string
) {
  this["satisfactionRating"] = rating;
  if (comment) {
    this["satisfactionComment"] = comment;
  }
  return this["save"]();
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
supportTicketSchema.pre("save", function (next) {
  // Yanıt süresi hesaplama (ilk yanıt için)
  if (this["conversations"].length > 0 && !this["responseTime"]) {
    const firstResponse = this["conversations"].find(
      (c) => c.senderType === "agent"
    );
    if (firstResponse) {
      this["responseTime"] = Math.floor(
        (firstResponse.createdAt.getTime() - this["createdAt"].getTime()) /
          (1000 * 60)
      ); // dakika
    }
  }

  // Son tarih kontrolü
  if (this["dueDate"] && this["dueDate"] < new Date() && this["isActive"]) {
    console.warn(`Destek talebi ${this["title"]} gecikmiş!`);
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const SupportTicket = mongoose.model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
