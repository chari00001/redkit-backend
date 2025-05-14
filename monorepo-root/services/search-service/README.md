# Redit Arama Servisi

Bu servis, Redit platformunda kullanıcılar, topluluklar ve gönderiler üzerinde arama yapmak için kullanılır.

## Özellikler

- Kullanıcı araması
- Topluluk araması
- Gönderi araması
- Tüm sonuçlar için birleşik arama
- Sonuçları sınırlama ve sayfalama

## API Endpoint'leri

### Genel Arama
`GET /api/search?query=arama_terimi&limit=10&offset=0`

Tüm entity tipleri (kullanıcılar, topluluklar, gönderiler) üzerinde arama yapar.

### Kullanıcı Araması
`GET /api/search/users?query=arama_terimi&limit=10&offset=0`

Sadece kullanıcılar üzerinde arama yapar.

### Topluluk Araması
`GET /api/search/communities?query=arama_terimi&limit=10&offset=0`

Sadece topluluklar üzerinde arama yapar.

### Gönderi Araması
`GET /api/search/posts?query=arama_terimi&limit=10&offset=0`

Sadece gönderiler üzerinde arama yapar.

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
   ```
   npm install
   ```

2. Örnek .env dosyasını kopyalayın ve kendi ayarlarınızı yapın:
   ```
   cp .env.example .env
   ```

3. Servisi başlatın:
   ```
   npm start
   ```

4. Geliştirme modu için:
   ```
   npm run dev
   ```

## Teknolojiler

- Node.js
- Express
- PostgreSQL
- Express Validator
- Dotenv
- CORS
- Helmet
- Morgan