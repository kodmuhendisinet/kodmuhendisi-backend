import mongoose, { Document, Schema } from "mongoose";

/**
 * Bildirim Türü Enum'u
 * Sistemdeki farklı bildirim türlerini tanımlar
 */
export enum NotificationType {
  PROJECT_UPDATE = "project_update", // Proje Güncellemesi - Proje durumu değişiklikleri
  TASK_ASSIGNMENT = "task_assignment", // Görev Ataması - Yeni görev atamaları
  MESSAGE_RECEIVED = "message_received", // Mesaj Alındı - Yeni mesaj bildirimleri
  SUPPORT_TICKET = "support_ticket", // Destek Talebi - Destek talebi güncellemeleri
  SYSTEM_ALERT = "system_alert", // Sistem Uyarısı - Sistem seviyesi uyarılar
  PERFORMANCE_REVIEW = "performance_review", // Performans Değerlendirmesi - Performans değerlendirme bildirimleri
  BIRTHDAY = "birthday", // Doğum Günü - Çalışan doğum günü bildirimleri
  REMINDER = "reminder", // Hatırlatma - Genel hatırlatmalar
  APPROVAL_REQUEST = "approval_request", // Onay Talebi - Onay bekleyen işlemler
  DEADLINE_APPROACHING = "deadline_approaching", // Son Tarih Yaklaşıyor - Yaklaşan son tarihler
}

/**
 * Bildirim Önceliği Enum'u
 * Bildirimin aciliyet seviyesini belirtir
 */
export enum NotificationPriority {
  LOW = "low", // Düşük - Normal öncelik
  NORMAL = "normal", // Normal - Standart öncelik
  HIGH = "high", // Yüksek - Acil
  URGENT = "urgent", // Acil - En yüksek öncelik
}

/**
 * Bildirim Durumu Enum'u
 * Bildirimin okunma durumunu belirtir
 */
export enum NotificationStatus {
  UNREAD = "unread", // Okunmadı - Henüz okunmamış
  READ = "read", // Okundu - Okunmuş
  ARCHIVED = "archived", // Arşivlendi - Arşivlenmiş
}

/**
 * Bildirim Interface'i
 * Mongoose Document'ini extend ederek bildirim verilerinin tipini tanımlar
 */
export interface INotification extends Document {
  // Temel Bildirim Bilgileri
  recipientId: mongoose.Types.ObjectId; // Alıcı kullanıcı
  type: NotificationType; // Bildirim türü
  title: string; // Bildirim başlığı
  message: string; // Bildirim mesajı

  // Bildirim Özellikleri
  priority: NotificationPriority; // Bildirim önceliği
  status: NotificationStatus; // Bildirim durumu

  // Ek Veriler
  data?: Record<string, any>; // Ek veri (proje ID, görev ID vb.)

  // Zaman Bilgileri
  readAt?: Date; // Okunma tarihi
  expiresAt?: Date; // Geçerlilik süresi

  // Eylem
  actionUrl?: string; // Tıklanınca gidilecek URL

  // Sistem Alanları
  createdAt: Date; // Oluşturulma tarihi
  updatedAt: Date; // Güncellenme tarihi
}

/**
 * Bildirim Şeması
 * MongoDB'de bildirim verilerinin nasıl saklanacağını tanımlar
 */
const notificationSchema = new Schema<INotification>(
  {
    // Temel İlişkiler
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Alıcı kullanıcı zorunludur"],
    },

    // Bildirim İçeriği
    type: {
      type: String,
      enum: {
        values: Object.values(NotificationType),
        message: "Geçersiz bildirim türü",
      },
      required: [true, "Bildirim türü zorunludur"],
    },
    title: {
      type: String,
      required: [true, "Bildirim başlığı zorunludur"],
      trim: true,
      maxlength: [200, "Başlık en fazla 200 karakter olabilir"],
    },
    message: {
      type: String,
      required: [true, "Bildirim mesajı zorunludur"],
      maxlength: [1000, "Mesaj en fazla 1000 karakter olabilir"],
    },

    // Bildirim Özellikleri
    priority: {
      type: String,
      enum: {
        values: Object.values(NotificationPriority),
        message: "Geçersiz bildirim önceliği",
      },
      default: NotificationPriority.NORMAL,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(NotificationStatus),
        message: "Geçersiz bildirim durumu",
      },
      default: NotificationStatus.UNREAD,
    },

    // Ek Veriler
    data: {
      type: Schema.Types.Mixed, // Herhangi bir veri türü
    },

    // Zaman Bilgileri
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },

    // Eylem
    actionUrl: {
      type: String,
      trim: true,
      maxlength: [500, "URL en fazla 500 karakter olabilir"],
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
notificationSchema.index({ recipientId: 1 }); // Alıcıya göre arama
notificationSchema.index({ type: 1 }); // Türüne göre filtreleme
notificationSchema.index({ status: 1 }); // Duruma göre filtreleme
notificationSchema.index({ priority: 1 }); // Önceliğe göre filtreleme
notificationSchema.index({ createdAt: -1 }); // Tarihe göre sıralama
notificationSchema.index({ expiresAt: 1 }); // Geçerlilik süresine göre

// Compound index'ler - birden fazla alan için
notificationSchema.index({ recipientId: 1, status: 1 }); // Alıcı ve durum
notificationSchema.index({ recipientId: 1, type: 1 }); // Alıcı ve tür
notificationSchema.index({ recipientId: 1, createdAt: -1 }); // Alıcı ve tarih

// TTL index - süresi dolan bildirimleri otomatik sil
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Virtual Fields (Hesaplanmış Alanlar)
 * Veritabanında saklanmayan ama hesaplanan alanlar
 */
notificationSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

notificationSchema.virtual("isUrgent").get(function () {
  return this.priority === NotificationPriority.URGENT;
});

notificationSchema.virtual("isHighPriority").get(function () {
  return (
    this.priority === NotificationPriority.HIGH ||
    this.priority === NotificationPriority.URGENT
  );
});

notificationSchema.virtual("isUnread").get(function () {
  return this.status === NotificationStatus.UNREAD;
});

notificationSchema.virtual("age").get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = now.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // gün cinsinden
});

/**
 * Statik Metodlar (Model seviyesi)
 * Tüm bildirimler üzerinde işlem yapan metodlar
 */
notificationSchema.statics.getUnreadCount = function (
  userId: mongoose.Types.ObjectId
) {
  return this.countDocuments({
    recipientId: userId,
    status: NotificationStatus.UNREAD,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });
};

notificationSchema.statics.getUnreadByType = function (
  userId: mongoose.Types.ObjectId,
  type: NotificationType
) {
  return this.countDocuments({
    recipientId: userId,
    type,
    status: NotificationStatus.UNREAD,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });
};

notificationSchema.statics.markAllAsRead = function (
  userId: mongoose.Types.ObjectId
) {
  return this.updateMany(
    {
      recipientId: userId,
      status: NotificationStatus.UNREAD,
    },
    {
      status: NotificationStatus.READ,
      readAt: new Date(),
    }
  );
};

notificationSchema.statics.cleanExpired = function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

notificationSchema.statics.getNotificationsByUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    recipientId: userId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.getHighPriorityNotifications = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    recipientId: userId,
    priority: { $in: [NotificationPriority.HIGH, NotificationPriority.URGENT] },
    status: NotificationStatus.UNREAD,
  });
};

/**
 * Instance Metodlar (Belge seviyesi)
 * Tek bir bildirim üzerinde işlem yapan metodlar
 */
notificationSchema.methods.markAsRead = function () {
  this["status"] = NotificationStatus.READ;
  this["readAt"] = new Date();
  return this["save"]();
};

notificationSchema.methods.archive = function () {
  this["status"] = NotificationStatus.ARCHIVED;
  return this["save"]();
};

notificationSchema.methods.extendExpiry = function (days: number) {
  this["expiresAt"] = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this["save"]();
};

notificationSchema.methods.isActionable = function () {
  return !!this.actionUrl;
};

/**
 * Middleware - Otomatik İşlemler
 * Veri kaydedilmeden önce yapılacak işlemler
 */
notificationSchema.pre("save", function (next) {
  // Varsayılan geçerlilik süresi (30 gün)
  if (!this["expiresAt"]) {
    this["expiresAt"] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Geçerlilik süresi kontrolü
  if (this["expiresAt"] && this["expiresAt"] < new Date()) {
    return next(new Error("Geçerlilik süresi geçmiş olamaz"));
  }

  // URL formatı kontrolü
  if (this["actionUrl"] && !this["actionUrl"].startsWith("http")) {
    return next(new Error("Geçerli bir URL giriniz"));
  }

  next();
});

/**
 * Mongoose Model'i Export Et
 * Bu model ile veritabanı işlemleri yapılacak
 */
export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
