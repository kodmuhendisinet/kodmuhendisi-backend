# 🗄️ Veritabanı Modelleri

Bu klasör, Kod Mühendisi V3 backend sisteminin tüm veritabanı modellerini içerir. Modeller MongoDB ve Mongoose kullanılarak TypeScript ile yazılmıştır.

## 📋 Model Listesi

### 🔐 Core Models (Ana Modeller)

#### 1. **User** - Kullanıcı Yönetimi

- **Dosya**: `User.ts`
- **Açıklama**: Sistem kullanıcılarını yönetir
- **Özellikler**:
  - Kimlik doğrulama ve yetkilendirme
  - Rol tabanlı erişim kontrolü
  - Kullanıcı tercihleri ve ayarları
  - Email doğrulama ve şifre sıfırlama

#### 2. **Project** - Proje Yönetimi

- **Dosya**: `Project.ts`
- **Açıklama**: Projeleri ve proje yaşam döngüsünü yönetir
- **Özellikler**:
  - Proje durumu ve kategorileri
  - Bütçe ve zaman takibi
  - Ekip yönetimi
  - Milestone ve gereksinimler

#### 3. **Task** - Görev Yönetimi

- **Dosya**: `Task.ts`
- **Açıklama**: Proje görevlerini ve alt görevleri yönetir
- **Özellikler**:
  - Görev atama ve takip
  - Zaman kayıtları
  - Bağımlılık yönetimi
  - Yorum ve dosya ekleme

#### 4. **Message** - Mesajlaşma Sistemi

- **Dosya**: `Message.ts`
- **Açıklama**: Kullanıcılar arası mesajlaşmayı yönetir
- **Özellikler**:
  - Mesaj gönderme ve alma
  - Dosya ekleme
  - Okundu/okunmadı durumu
  - Yıldızlama ve arşivleme

#### 5. **SupportTicket** - Destek Talepleri

- **Dosya**: `SupportTicket.ts`
- **Açıklama**: Müşteri destek taleplerini yönetir
- **Özellikler**:
  - Talep kategorileri ve öncelikleri
  - Atama ve eskalasyon
  - Yanıt süresi takibi
  - Müşteri memnuniyeti

### 👥 HR Models (İnsan Kaynakları Modelleri)

#### 6. **Employee** - Çalışan Yönetimi

- **Dosya**: `Employee.ts`
- **Açıklama**: Şirket çalışanlarını yönetir
- **Özellikler**:
  - Çalışan bilgileri ve departmanlar
  - Performans değerlendirmeleri
  - İş programı ve izinler
  - Doküman yönetimi

#### 7. **Job** - İş İlanları

- **Dosya**: `Job.ts`
- **Açıklama**: Açık pozisyonları yönetir
- **Özellikler**:
  - İlan detayları ve gereksinimler
  - Başvuru süreci
  - SEO optimizasyonu
  - İstatistikler

#### 8. **JobApplication** - İş Başvuruları

- **Dosya**: `JobApplication.ts`
- **Açıklama**: İş başvurularını yönetir
- **Özellikler**:
  - Başvuru süreci takibi
  - Mülakat yönetimi
  - Referans kontrolü
  - Değerlendirme sistemi

### 🔔 System Models (Sistem Modelleri)

#### 9. **Notification** - Bildirim Sistemi

- **Dosya**: `Notification.ts`
- **Açıklama**: Sistem bildirimlerini yönetir
- **Özellikler**:
  - Bildirim türleri ve öncelikleri
  - Geçerlilik süresi
  - Okundu/okunmadı durumu
  - Otomatik temizleme

## 🏗️ Model Özellikleri

### 🔧 Teknik Özellikler

- **TypeScript**: Tam tip güvenliği
- **Mongoose**: MongoDB ODM
- **Validation**: Giriş doğrulama
- **Indexing**: Performans optimizasyonu
- **Middleware**: Otomatik işlemler

### 📊 Veri Yapısı

- **Enum Types**: Durum ve kategori tanımları
- **Virtual Fields**: Hesaplanmış alanlar
- **Static Methods**: Model seviyesi işlemler
- **Instance Methods**: Belge seviyesi işlemler

### 🔐 Güvenlik

- **Password Hashing**: bcrypt ile şifreleme
- **Input Validation**: Giriş verisi doğrulama
- **Access Control**: Rol tabanlı erişim
- **Audit Trail**: Değişiklik takibi

## 📈 İlişkiler ve Referanslar

### 🔗 Model İlişkileri

```
User (1) ←→ (N) Project
User (1) ←→ (N) Task
User (1) ←→ (N) Message
User (1) ←→ (N) SupportTicket
User (1) ←→ (1) Employee
User (1) ←→ (N) JobApplication
User (1) ←→ (N) Notification

Project (1) ←→ (N) Task
Project (1) ←→ (N) Message
Job (1) ←→ (N) JobApplication
```

### 📋 Referans Yapısı

- **ObjectId References**: MongoDB referans sistemi
- **Population**: İlişkili veri yükleme
- **Cascade Operations**: Bağımlı veri işlemleri

## 🚀 Kullanım Örnekleri

### 📝 Model Oluşturma

```typescript
import { User, UserRole } from "../models";

const user = new User({
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.CUSTOMER,
});

await user.save();
```

### 🔍 Veri Sorgulama

```typescript
import { Project, ProjectStatus } from "../models";

const activeProjects = await Project.find({
  status: ProjectStatus.IN_PROGRESS,
}).populate("clientId");
```

### 📊 İstatistik Sorgulama

```typescript
import { Task } from "../models";

const taskStats = await Task.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
]);
```

## 🔧 Bakım ve Güncelleme

### 📋 Düzenli Kontroller

- [ ] Index performansı
- [ ] Veri tutarlılığı
- [ ] Şema validasyonu
- [ ] İlişki bütünlüğü

### 🔄 Güncelleme Süreci

1. Şema değişikliklerini planla
2. Migration script'leri hazırla
3. Test ortamında dene
4. Production'a uygula
5. Performansı izle

## 📚 Ek Kaynaklar

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/data-modeling/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Bu modeller, Kod Mühendisi V3 sisteminin temelini oluşturur ve tüm iş süreçlerini destekleyecek şekilde tasarlanmıştır.
