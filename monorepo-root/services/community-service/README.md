# Redit Topluluk Servisi

Bu servis, Redit platformundaki topluluk yönetiminden sorumludur. Topluluk oluşturma, silme, güncelleme, üyelik işlemleri gibi temel işlevleri sağlar.

## Özellikler

- Topluluk oluşturma ve yönetme
- Topluluk detaylarını görüntüleme 
- Topluluklara üye olma ve ayrılma
- Topluluk üyelerini yönetme ve rolleri güncelleme
- Özel ve kısıtlanmış topluluklar için izin kontrolü

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env.example` dosyasını `.env` olarak kopyalayın ve yapılandırın:
```bash
cp .env.example .env
```

3. Veritabanı bağlantısını yapılandırın:
PostgreSQL veritabanınızın ayarlarını `.env` dosyasında güncelleyin.

## Çalıştırma

Geliştirme modunda çalıştırmak için:
```bash
npm run dev
```

Üretim modunda çalıştırmak için:
```bash
npm start
```

## API Endpointleri

### Topluluklar

- `GET /api/communities` - Tüm toplulukları listele
- `GET /api/communities/:id` - Belirli bir topluluğun detaylarını getir
- `POST /api/communities` - Yeni topluluk oluştur
- `PUT /api/communities/:id` - Topluluk bilgilerini güncelle
- `DELETE /api/communities/:id` - Topluluğu sil

### Üyelik İşlemleri

- `GET /api/communities/:id/members` - Topluluk üyelerini listele
- `POST /api/communities/:id/join` - Topluluğa katıl
- `POST /api/communities/:id/leave` - Topluluktan ayrıl
- `PUT /api/communities/:id/members/:userId` - Üye rolünü güncelle

### Kullanıcı Toplulukları

- `GET /api/communities/user` - Giriş yapmış kullanıcının topluluklarını getir
- `GET /api/communities/user/:userId` - Belirli bir kullanıcının topluluklarını getir

## Veritabanı Modeli

Servis, aşağıdaki ana veritabanı tablolarını kullanır:

- `Communities` - Topluluk bilgileri
- `User_Communities` - Kullanıcı-topluluk ilişkileri

## Test

API'yi test etmek için:
```bash
./test.sh
```

## Docker

Docker ile çalıştırmak için:
```bash
docker build -t redit-community-service .
docker run -p 3002:3002 redit-community-service
``` 