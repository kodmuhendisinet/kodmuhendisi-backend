# 🚀 Kod Mühendisi Backend Yol Haritası

## 📋 Proje Genel Bakış

Bu backend sistemi, dijital ajans yönetimi için kapsamlı bir platform sağlar. Müşteri yönetimi, proje takibi, ekip koordinasyonu ve destek sistemi gibi temel işlevleri destekler.

## 🎯 Sistem Mimarisi

### Teknoloji Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Veritabanı**: PostgreSQL + Redis (cache)
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Token
- **File Storage**: Cloudinary
- **Email**: Nodemailer + SendGrid
- **Real-time**: Socket.io
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Monitoring**: Winston + Sentry

## 👥 Kullanıcı Rolleri ve Yetkileri

### 1. Super Admin (Süper Yönetici)

- **Yetkiler**: Sistem genelinde tam kontrol
- **İşlevler**:
  - Tüm kullanıcıları yönetme
  - Sistem ayarlarını yapılandırma
  - Yeni admin kullanıcıları oluşturma
  - Sistem raporlarını görüntüleme
  - Backup ve restore işlemleri

### 2. Admin (Yönetici)

- **Yetkiler**: Şirket genelinde yönetim
- **İşlevler**:
  - Müşteri yönetimi
  - Proje yönetimi
  - Ekip yönetimi
  - Finansal raporlar
  - Sistem ayarları

### 3. Proje Yöneticisi

- **Yetkiler**: Atanan projelerde tam kontrol
- **İşlevler**:
  - Proje planlama ve takip
  - Ekip üyelerini atama
  - Müşteri iletişimi
  - Proje raporları
  - Görev yönetimi

### 4. SEO Ekibi

- **Yetkiler**: SEO projelerinde çalışma
- **İşlevler**:
  - SEO analizi ve raporlama
  - Anahtar kelime araştırması
  - İçerik optimizasyonu
  - Teknik SEO çalışmaları
  - Müşteri iletişimi

### 5. Tasarım Ekibi

- **Yetkiler**: Tasarım projelerinde çalışma
- **İşlevler**:
  - Logo ve kurumsal kimlik tasarımı
  - Web tasarımı
  - Grafik tasarım
  - Müşteri onayları
  - Tasarım revizyonları

### 6. Geliştirici Ekibi

- **Yetkiler**: Teknik projelerde çalışma
- **İşlevler**:
  - Web geliştirme
  - Mobil uygulama geliştirme
  - API geliştirme
  - Veritabanı yönetimi
  - Test ve deployment

### 7. Müşteri (Customer)

- **Yetkiler**: Kendi projelerini görüntüleme
- **İşlevler**:
  - Proje durumunu takip etme
  - Mesaj gönderme
  - Dosya yükleme
  - Ödeme yapma
  - Proje onayları

### 8. Müşteri Temsilcisi

- **Yetkiler**: Müşteri ilişkileri ve destek taleplerini yönetme
- **İşlevler**:
  - Müşteri destek talepleri
  - Teknik destek koordinasyonu
  - Öncelik belirleme ve yönlendirme
  - Çözüm takibi ve müşteri iletişimi
  - Müşteri memnuniyeti ve geri bildirim
  - Müşteri onboarding ve eğitim
  - Satış sonrası destek

### 9. İnsan Kaynakları

- **Yetkiler**: Ekip yönetimi ve insan kaynakları süreçleri
- **İşlevler**:
  - İşe alım ve işe yerleştirme
  - Ekip üyesi performans değerlendirmesi
  - Eğitim ve gelişim planlaması
  - İş tanımları ve organizasyon yapısı
  - Çalışan memnuniyeti ve motivasyon
  - Kariyer planlama ve terfi süreçleri
  - Ekip büyüme ve küçülme stratejileri

## 🗄️ Veritabanı Modelleri

### Core Models (Ana Modeller)

#### User (Kullanıcı)

```typescript
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  position?: string;
  joinDate: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Project (Proje)

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  projectManagerId: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  progress: number;
  tags: string[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task (Görev)

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Message (Mesaj)

```typescript
interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  recipientId: string;
  projectId?: string;
  status: MessageStatus;
  priority: MessagePriority;
  category: MessageCategory;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### SupportTicket (Destek Talebi)

```typescript
interface SupportTicket {
  id: string;
  title: string;
  description: string;
  customerId: string;
  assignedTo?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: TicketChannel;
  responseTime?: number;
  satisfactionRating?: number;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Employee (Çalışan)

```typescript
interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  department: Department;
  position: string;
  hireDate: Date;
  salary: number;
  managerId?: string;
  skills: string[];
  certifications: string[];
  performanceRating?: number;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enum Types (Enum Tipleri)

#### UserRole

```typescript
enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  PROJECT_MANAGER = "project_manager",
  SEO_SPECIALIST = "seo_specialist",
  DESIGNER = "designer",
  DEVELOPER = "developer",
  CUSTOMER_SERVICE = "customer_service",
  HR_MANAGER = "hr_manager",
  CUSTOMER = "customer",
}
```

#### ProjectStatus

```typescript
enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
```

#### ProjectCategory

```typescript
enum ProjectCategory {
  WEB_DESIGN = "web_design",
  E_COMMERCE = "e_commerce",
  DIGITAL_MARKETING = "digital_marketing",
  MOBILE_APP = "mobile_app",
  SEO = "seo",
  GRAPHIC_DESIGN = "graphic_design",
  CRM_SYSTEM = "crm_system",
}
```

#### Department

```typescript
enum Department {
  DEVELOPMENT = "development",
  DESIGN = "design",
  SEO = "seo",
  MARKETING = "marketing",
  SALES = "sales",
  CUSTOMER_SERVICE = "customer_service",
  HR = "hr",
  FINANCE = "finance",
  ADMINISTRATION = "administration",
}
```

#### EmployeeStatus

````typescript
enum EmployeeStatus {
  ACTIVE = "active",
  PROBATION = "probation",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
  RESIGNED = "resigned",
}

## 🔐 Authentication & Authorization

### JWT Token Yapısı

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}
````

### Permission System (İzin Sistemi)

```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Örnek izinler
const PERMISSIONS = {
  // Kullanıcı yönetimi
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Proje yönetimi
  PROJECT_CREATE: "project:create",
  PROJECT_READ: "project:read",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",

  // Finansal işlemler
  FINANCE_READ: "finance:read",
  FINANCE_UPDATE: "finance:update",

  // İnsan kaynakları
  HR_EMPLOYEE_READ: "hr:employee:read",
  HR_EMPLOYEE_CREATE: "hr:employee:create",
  HR_EMPLOYEE_UPDATE: "hr:employee:update",
  HR_EMPLOYEE_DELETE: "hr:employee:delete",
  HR_PERFORMANCE_READ: "hr:performance:read",
  HR_PERFORMANCE_UPDATE: "hr:performance:update",
  HR_RECRUITMENT_READ: "hr:recruitment:read",
  HR_RECRUITMENT_UPDATE: "hr:recruitment:update",

  // Sistem ayarları
  SYSTEM_SETTINGS: "system:settings",
};
```

### Role-Based Access Control (RBAC)

```typescript
interface RolePermissions {
  [UserRole.SUPER_ADMIN]: Permission[];
  [UserRole.ADMIN]: Permission[];
  [UserRole.PROJECT_MANAGER]: Permission[];
  [UserRole.SEO_SPECIALIST]: Permission[];
  [UserRole.DESIGNER]: Permission[];
  [UserRole.DEVELOPER]: Permission[];
  [UserRole.CUSTOMER_SERVICE]: Permission[];
  [UserRole.HR_MANAGER]: Permission[];
  [UserRole.CUSTOMER]: Permission[];
}
```

## 🚀 API Endpoints

### Authentication Routes

```
POST   /api/auth/register          # Kullanıcı kaydı
POST   /api/auth/login             # Kullanıcı girişi
POST   /api/auth/refresh           # Token yenileme
POST   /api/auth/logout            # Çıkış
POST   /api/auth/forgot-password   # Şifre sıfırlama
POST   /api/auth/reset-password    # Şifre sıfırlama
POST   /api/auth/verify-email      # Email doğrulama
```

### User Management Routes

```
GET    /api/users                  # Kullanıcı listesi
GET    /api/users/:id              # Kullanıcı detayı
POST   /api/users                  # Yeni kullanıcı oluşturma
PUT    /api/users/:id              # Kullanıcı güncelleme
DELETE /api/users/:id              # Kullanıcı silme
GET    /api/users/:id/projects     # Kullanıcının projeleri
GET    /api/users/:id/activities   # Kullanıcı aktiviteleri
```

### Project Management Routes

```
GET    /api/projects               # Proje listesi
GET    /api/projects/:id           # Proje detayı
POST   /api/projects               # Yeni proje oluşturma
PUT    /api/projects/:id           # Proje güncelleme
DELETE /api/projects/:id           # Proje silme
GET    /api/projects/:id/tasks     # Proje görevleri
GET    /api/projects/:id/messages  # Proje mesajları
GET    /api/projects/:id/team      # Proje ekibi
POST   /api/projects/:id/assign    # Ekip üyesi atama
```

### Task Management Routes

```
GET    /api/tasks                  # Görev listesi
GET    /api/tasks/:id              # Görev detayı
POST   /api/tasks                  # Yeni görev oluşturma
PUT    /api/tasks/:id              # Görev güncelleme
DELETE /api/tasks/:id              # Görev silme
POST   /api/tasks/:id/assign       # Görev atama
POST   /api/tasks/:id/complete     # Görev tamamlama
GET    /api/tasks/:id/time-logs    # Görev zaman kayıtları
```

### Communication Routes

```
GET    /api/messages               # Mesaj listesi
GET    /api/messages/:id           # Mesaj detayı
POST   /api/messages               # Yeni mesaj gönderme
PUT    /api/messages/:id           # Mesaj güncelleme
DELETE /api/messages/:id           # Mesaj silme
POST   /api/messages/:id/reply     # Mesaja yanıt verme
POST   /api/messages/:id/star      # Mesajı yıldızla
GET    /api/messages/unread        # Okunmamış mesajlar
```

### Support Routes

```
GET    /api/support/tickets        # Destek talepleri
GET    /api/support/tickets/:id    # Talep detayı
POST   /api/support/tickets        # Yeni talep oluşturma
PUT    /api/support/tickets/:id    # Talep güncelleme
POST   /api/support/tickets/:id/assign  # Talep atama
POST   /api/support/tickets/:id/close   # Talep kapatma
GET    /api/support/analytics      # Destek analitikleri
```

### HR Management Routes

```
GET    /api/hr/employees           # Çalışan listesi
GET    /api/hr/employees/:id       # Çalışan detayı
POST   /api/hr/employees           # Yeni çalışan ekleme
PUT    /api/hr/employees/:id       # Çalışan güncelleme
DELETE /api/hr/employees/:id       # Çalışan silme
GET    /api/hr/departments         # Departman listesi
GET    /api/hr/positions           # Pozisyon listesi
GET    /api/hr/performance         # Performans değerlendirmeleri
POST   /api/hr/performance/:id     # Performans değerlendirmesi ekleme
GET    /api/hr/recruitment         # İşe alım süreçleri
POST   /api/hr/recruitment         # Yeni işe alım süreci
GET    /api/hr/training            # Eğitim programları
POST   /api/hr/training            # Yeni eğitim programı
```

### Analytics & Reporting Routes

```
GET    /api/analytics/dashboard    # Dashboard verileri
GET    /api/analytics/projects     # Proje analitikleri
GET    /api/analytics/users        # Kullanıcı analitikleri
GET    /api/analytics/finance      # Finansal analitikler
GET    /api/analytics/performance  # Performans metrikleri
GET    /api/analytics/hr           # İK analitikleri
GET    /api/reports/projects       # Proje raporları
GET    /api/reports/users          # Kullanıcı raporları
GET    /api/reports/finance        # Finansal raporlar
GET    /api/reports/hr             # İK raporları
```

## 🔧 Middleware Yapısı

### Core Middleware

```typescript
// Authentication middleware
app.use("/api", authenticateToken);

// Role-based authorization
app.use("/api/admin", requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]));
app.use("/api/projects", requireProjectAccess);

// Rate limiting
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek
  })
);

// Request validation
app.use("/api", validateRequest);

// Error handling
app.use(errorHandler);
```

### Custom Middleware

```typescript
// Proje erişim kontrolü
const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = req.params.projectId || req.body.projectId;
  const userId = req.user.id;

  const hasAccess = await checkProjectAccess(userId, projectId);
  if (!hasAccess) {
    return res.status(403).json({ message: "Proje erişimi reddedildi" });
  }

  next();
};

// Dosya yükleme kontrolü
const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenmedi" });
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: "Geçersiz dosya türü" });
  }

  next();
};
```

## 📊 Real-time Features

### Socket.io Events

```typescript
// Bağlantı yönetimi
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  // Kullanıcıyı odaya ekle
  socket.join(`user:${userId}`);

  // Proje odalarına ekle
  socket.on("join-project", (projectId) => {
    socket.join(`project:${projectId}`);
  });

  // Mesaj gönderme
  socket.on("send-message", async (data) => {
    const message = await createMessage(data);
    io.to(`project:${data.projectId}`).emit("new-message", message);
  });

  // Görev güncelleme
  socket.on("update-task", async (data) => {
    const task = await updateTask(data);
    io.to(`project:${data.projectId}`).emit("task-updated", task);
  });

  // Online durum
  socket.on("set-online", () => {
    io.emit("user-online", userId);
  });
});
```

## 🗂️ File Management

### Cloudinary Integration

```typescript
interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

const uploadToCloudinary = async (file: FileUpload, folder: string) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `kodmuhendisi/${folder}`,
    resource_type: "auto",
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto" },
    ],
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    size: result.bytes,
  };
};
```

## 📧 Email System

### Email Templates

```typescript
interface EmailTemplate {
  welcome: string;
  projectUpdate: string;
  taskAssignment: string;
  messageNotification: string;
  supportTicketUpdate: string;
  passwordReset: string;
  emailVerification: string;
}

const sendEmail = async (to: string, template: string, data: any) => {
  const html = await renderEmailTemplate(template, data);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: data.subject,
    html,
  });
};
```

## 🧪 Testing Strategy

### Test Structure

```typescript
// Unit Tests
describe("User Service", () => {
  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      // Test implementation
    });

    it("should throw error for duplicate email", async () => {
      // Test implementation
    });
  });
});

// Integration Tests
describe("Project API", () => {
  describe("POST /api/projects", () => {
    it("should create project with valid data", async () => {
      // Test implementation
    });
  });
});

// E2E Tests
describe("User Workflow", () => {
  it("should complete user registration and project creation", async () => {
    // Test implementation
  });
});
```

## 📈 Performance & Monitoring

### Caching Strategy

```typescript
// Redis caching
const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

### Logging & Monitoring

```typescript
// Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Performance monitoring
const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
    });
  });

  next();
};
```

## 🚀 Deployment & DevOps

### Environment Configuration

```typescript
// Environment variables
const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production",
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
```

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### CI/CD Pipeline

```yaml
# GitHub Actions
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deployment commands
```

## 📋 Development Phases

### Phase 1: Foundation (Hafta 1-2)

- [ ] Proje yapısı kurulumu
- [ ] Veritabanı modelleri
- [ ] Temel authentication
- [ ] User management API
- [ ] Temel middleware

### Phase 2: Core Features (Hafta 3-4)

- [ ] Project management API
- [ ] Task management API
- [ ] File upload system
- [ ] Basic authorization
- [ ] Email system

### Phase 3: Communication (Hafta 5-6)

- [ ] Message system API
- [ ] Real-time features
- [ ] Notification system
- [ ] Support ticket system
- [ ] Advanced authorization

### Phase 4: Analytics & Reporting (Hafta 7-8)

- [ ] Analytics API
- [ ] Reporting system
- [ ] Dashboard data
- [ ] Performance monitoring
- [ ] Caching implementation

### Phase 5: Testing & Optimization (Hafta 9-10)

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

### Phase 6: Deployment (Hafta 11-12)

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup system
- [ ] CI/CD pipeline
- [ ] Performance testing

## 🔒 Security Considerations

### Security Measures

- JWT token rotation
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js security headers
- Request size limits
- File type validation

### Data Protection

- Password hashing (bcrypt)
- Sensitive data encryption
- Audit logging
- GDPR compliance
- Data backup strategy
- Access control logging

## 📚 API Documentation

### Swagger/OpenAPI

```typescript
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kod Mühendisi API",
      version: "1.0.0",
      description: "Dijital ajans yönetim sistemi API",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
```

## 🎯 Success Metrics

### Performance Metrics

- API response time < 200ms
- Database query time < 50ms
- 99.9% uptime
- Support for 1000+ concurrent users

### Quality Metrics

- 90%+ test coverage
- < 1% error rate
- < 100ms average response time
- Zero security vulnerabilities

Bu yol haritası, frontend projesinin tüm ihtiyaçlarını karşılayacak kapsamlı bir backend sistemi geliştirmek için tasarlanmıştır. Her faz, önceki fazın üzerine inşa edilir ve sistemin güvenli, ölçeklenebilir ve performanslı olmasını sağlar.
