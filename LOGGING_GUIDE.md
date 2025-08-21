# Logging Kılavuzu

## Log Seviyeleri

Bu projede Winston logger kullanılmaktadır. Log seviyeleri şu şekildedir:

- `error`: Hatalar
- `warn`: Uyarılar
- `info`: Bilgi mesajları
- `debug`: Debug mesajları
- `verbose`: Detaylı mesajlar
- `silly`: En detaylı mesajlar

## Log Seviyesini Değiştirme

### Environment Variable ile

`.env` dosyasında `LOG_LEVEL` değişkenini ayarlayın:

```bash
# Sadece hataları göster
LOG_LEVEL=error

# Hatalar ve uyarıları göster
LOG_LEVEL=warn

# Hatalar, uyarılar ve bilgi mesajlarını göster (varsayılan)
LOG_LEVEL=info

# Tüm mesajları göster
LOG_LEVEL=debug
```

### Nodemon ile

`nodemon.json` dosyasında `quiet: true` ayarı ile gereksiz nodemon loglarını gizleyebilirsiniz.

## Log Dosyaları

Loglar `logs/` klasöründe saklanır:

- `logs/error.log`: Sadece hata logları
- `logs/combined.log`: Tüm loglar

## HTTP Request Logging

Tüm HTTP istekleri otomatik olarak loglanır:

```typescript
// Örnek log çıktısı
2024-01-15 10:30:45 [info]: HTTP Request {
  "method": "GET",
  "url": "/admin",
  "status": 200,
  "duration": "5587ms",
  "ip": "::1",
  "userAgent": "Mozilla/5.0..."
}
```

## Gereksiz Logları Gizleme

### 1. Nodemon Logları

`package.json`'da:

```json
{
  "scripts": {
    "dev": "nodemon --quiet",
    "dev:verbose": "nodemon src/index.ts"
  }
}
```

### 2. Log Seviyesini Yükseltme

Sadece önemli logları görmek için:

```bash
LOG_LEVEL=warn
```

### 3. Console Loglarını Kapatma

Production ortamında console logları otomatik olarak kapatılır.

## Özel Log Mesajları

```typescript
import logger from "./config/logger";

// Bilgi mesajı
logger.info("Kullanıcı giriş yaptı", { userId: 123 });

// Uyarı mesajı
logger.warn("Rate limit aşıldı", { ip: req.ip });

// Hata mesajı
logger.error("Veritabanı bağlantı hatası", { error: err.message });
```

## Log Rotasyonu

Log dosyaları otomatik olarak 5MB'a ulaştığında rotate edilir ve maksimum 5 dosya saklanır.
