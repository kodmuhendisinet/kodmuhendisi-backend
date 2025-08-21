import mongoose, { Document, Schema } from "mongoose";

/**
 * Mesaj Durumu Enum'u
 * Mesajın iletişim sürecindeki farklı aşamalarını tanımlar
 */
export enum MessageStatus {
  SENT = "sent", // Gönderildi - Mesaj gönderildi
  DELIVERED = "delivered", // Teslim Edildi - Alıcıya ulaştı
  READ = "read", // Okundu - Alıcı okudu
  FAILED = "failed", // Başarısız - Gönderilemedi
}

/**
 * Mesaj Önceliği Enum'u
 * Mesajın aciliyet seviyesini belirtir
 */
export enum MessagePriority {
  LOW = "low", // Düşük - Normal öncelik
  NORMAL = "normal", // Normal - Standart öncelik
  HIGH = "high", // Yüksek - Acil
  URGENT = "urgent", // Acil - En yüksek öncelik
}

/**
 * Mesaj Kategorisi Enum'u
 * Mesajın hangi konu başlığında olduğunu belirtir
 */
export enum MessageCategory {
  GENERAL = "general", // Genel - Genel mesajlar
  PROJECT = "project", // Proje - Proje ile ilgili
  SUPPORT = "support", // Destek - Destek talepleri
  NOTIFICATION = "notification", // Bildirim - Sistem bildirimleri
  SYSTEM = "system", // Sistem - Sistem mesajları
}

/**
 * Mesaj Interface'i
 * Mongoose Document'ini extend ederek mesaj verilerinin tipini tanımlar
 */
export interface IMessage extends Document {
  // Temel Mesaj Bilgileri
  subject: string; // Mesaj konusu
  content: string; // Mesaj içeriği
  senderId: mongoose.Types.ObjectId; // Gönderen kullanıcı
  recipientId: mongoose.Types.ObjectId; // Alıcı kullanıcı
  projectId?: mongoose.Types.ObjectId; // İlgili proje (opsiyonel)

  // Mesaj Özellikleri
  status: MessageStatus; // Mesaj durumu
  priority: MessagePriority; // Mesaj önceliği
  category: MessageCategory; // Mesaj kategorisi

  // Okunma ve Organizasyon
  isRead: boolean; // Okundu mu?
  isStarred: boolean; // Yıldızlandı mı?
  isArchived: boolean; // Arşivlendi mi?
  hasAttachments: boolean; // Ek dosya var mı?

  // Dosya Yönetimi
  attachments: {
    filename: string; // Dosya adı
    originalName: string; // Orijinal dosya adı
    url: string; // Dosya URL'i
    size: number; // Dosya boyutu (byte)
    mimeType: string; // Dosya türü
    uploadedAt: Date; // Yükleme tarihi
  }[];

  // Mesaj Zinciri
  replyTo?: mongoose.Types.ObjectId; // Yanıtlanan mesaj
  forwardedFrom?: mongoose.Types.ObjectId; // İletilen mesaj

  // Zaman Bilgileri
  readAt?: Date; // Okunma tarihi
  deliveredAt?: Date; // Teslim tarihi

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Mesaj Şeması
 * MongoDB'de mesaj verilerinin nasıl saklanacağını tanımlar
 */
const messageSchema = new Schema<IMessage>(
  {
    // Temel Bilgiler
    subject: {
      type: String,
      required: [true, "Mesaj konusu zorunludur"],
      trim: true,
      maxlength: [200, "Konu en fazla 200 karakter olabilir"],
    },
    content: {
      type: String,
      required: [true, "Mesaj içeriği zorunludur"],
      maxlength: [10000, "İçerik en fazla 10000 karakter olabilir"],
    },

    // İlişkiler
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Gönderen kullanıcı zorunludur"],
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Alıcı kullanıcı zorunludur"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    // Mesaj Özellikleri
    status: {
      type: String,
      enum: {
        values: Object.values(MessageStatus),
        message: "Geçersiz mesaj durumu",
      },
      default: MessageStatus.SENT,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(MessagePriority),
        message: "Geçersiz mesaj önceliği",
      },
      default: MessagePriority.NORMAL,
    },
    category: {
      type: String,
      enum: {
        values: Object.values(MessageCategory),
        message: "Geçersiz mesaj kategorisi",
      },
      default: MessageCategory.GENERAL,
    },

    // Okunma ve Organizasyon
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
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
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Mesaj Zinciri
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    forwardedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    // Zaman Bilgileri
    readAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
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
messageSchema.index({ senderId: 1 }); // Gönderene göre arama
messageSchema.index({ recipientId: 1 }); // Alıcıya göre arama
messageSchema.index({ projectId: 1 }); // Projeye göre arama
messageSchema.index({ status: 1 }); // Duruma göre filtreleme
messageSchema.index({ priority: 1 }); // Önceliğe göre filtreleme
messageSchema.index({ category: 1 }); // Kategoriye göre filtreleme
messageSchema.index({ isRead: 1 }); // Okunma durumuna göre
messageSchema.index({ isStarred: 1 }); // Yıldızlanma durumuna göre
messageSchema.index({ isArchived: 1 }); // Arşivlenme durumuna göre
messageSchema.index({ createdAt: -1 }); // Tarihe göre sıralama (yeni önce)
messageSchema.index({ replyTo: 1 }); // Yanıtlanan mesaja göre

// Compound index'ler - birden fazla alan için
messageSchema.index({ recipientId: 1, isRead: 1 }); // Alıcı ve okunma durumu
messageSchema.index({ recipientId: 1, isArchived: 1 }); // Alıcı ve arşiv durumu
messageSchema.index({ senderId: 1, createdAt: -1 }); // Gönderen ve tarih
messageSchema.index({ recipientId: 1, createdAt: -1 }); // Alıcı ve tarih

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
messageSchema.pre("save", function (next) {
  // Ek dosya kontrolü
  this["hasAttachments"] = this["attachments"].length > 0;
  next();
});

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
messageSchema.virtual("isUrgent").get(function () {
  return this.priority === MessagePriority.URGENT;
});

messageSchema.virtual("isHighPriority").get(function () {
  return (
    this.priority === MessagePriority.HIGH ||
    this.priority === MessagePriority.URGENT
  );
});

messageSchema.virtual("isProjectRelated").get(function () {
  return this.category === MessageCategory.PROJECT || this.projectId;
});

messageSchema.virtual("isUnread").get(function () {
  return !this.isRead;
});

messageSchema.virtual("age").get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = now.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // gün cinsinden
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm mesajlar üzerinde işlem yapan metodlar
 */
messageSchema.statics.getUnreadCount = function (
  userId: mongoose.Types.ObjectId
) {
  return this.countDocuments({
    recipientId: userId,
    isRead: false,
    isArchived: false,
  });
};

messageSchema.statics.getStarredCount = function (
  userId: mongoose.Types.ObjectId
) {
  return this.countDocuments({
    $or: [
      { senderId: userId, isStarred: true },
      { recipientId: userId, isStarred: true },
    ],
  });
};

messageSchema.statics.getMessagesByUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    $or: [{ senderId: userId }, { recipientId: userId }],
  }).populate("senderId recipientId");
};

messageSchema.statics.getConversation = function (
  user1Id: mongoose.Types.ObjectId,
  user2Id: mongoose.Types.ObjectId
) {
  return this.find({
    $or: [
      { senderId: user1Id, recipientId: user2Id },
      { senderId: user2Id, recipientId: user1Id },
    ],
  }).sort({ createdAt: 1 });
};

messageSchema.statics.getProjectMessages = function (
  projectId: mongoose.Types.ObjectId
) {
  return this.find({ projectId }).populate("senderId recipientId");
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir mesaj üzerinde işlem yapan metodlar
 */
messageSchema.methods.markAsRead = function () {
  this["isRead"] = true;
  this["readAt"] = new Date();
  this["status"] = MessageStatus.READ;
  return this["save"]();
};

messageSchema.methods.markAsDelivered = function () {
  this["status"] = MessageStatus.DELIVERED;
  this["deliveredAt"] = new Date();
  return this["save"]();
};

messageSchema.methods.toggleStar = function () {
  this["isStarred"] = !this["isStarred"];
  return this["save"]();
};

messageSchema.methods.archive = function () {
  this["isArchived"] = true;
  return this["save"]();
};

messageSchema.methods.unarchive = function () {
  this["isArchived"] = false;
  return this["save"]();
};

messageSchema.methods.reply = function (
  subject: string,
  content: string,
  senderId: mongoose.Types.ObjectId
) {
  // Bu mesaja yanıt oluştur
  const reply = new this.constructor({
    subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
    content,
    senderId,
    recipientId: this["senderId"],
    projectId: this["projectId"],
    replyTo: this["_id"],
    category: this["category"],
  });
  return reply["save"]();
};

messageSchema.methods.forward = function (
  recipientId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId
) {
  // Bu mesajı ilet
  const forwarded = new this.constructor({
    subject: this["subject"].startsWith("Fwd:")
      ? this["subject"]
      : `Fwd: ${this["subject"]}`,
    content: this["content"],
    senderId,
    recipientId,
    projectId: this["projectId"],
    forwardedFrom: this["_id"],
    category: this["category"],
    attachments: this["attachments"],
  });
  return forwarded["save"]();
};

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Message = mongoose.model<IMessage>("Message", messageSchema);
