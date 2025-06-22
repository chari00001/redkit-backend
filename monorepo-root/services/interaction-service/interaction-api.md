# Etkileşim API Dokümantasyonu

Bu API, kullanıcıların çeşitli etiketlerle etkileşimlerini yönetmek için kullanılır.

## Etkileşim Türleri

- `like`: Beğeni
- `view`: Görüntüleme
- `share`: Paylaşım
- `comment`: Yorum

## API Endpointleri

### 1. Etkileşim Kaydetme

**Endpoint:** `POST /interactions`

**İstek (Request):**
```json
{
  "userId": "kullanıcı_id",
  "tag": "etiket_adı",
  "interactionType": "like|view|share|comment"
}
```

**Başarılı Yanıt (200):**
```json
{
  "user_id": "kullanıcı_id",
  "tag": "etiket_adı",
  "interaction_type": "etkileşim_türü",
  "interaction_count": 1,
  "last_interacted_at": "etkileşim_tarihi"
}
```

### 2. Kullanıcının Tüm Etkileşimlerini Getirme

**Endpoint:** `GET /users/:userId/interactions`

**Parametreler:**
- `type` (isteğe bağlı): Belirli bir etkileşim türüne göre filtreleme

**Başarılı Yanıt (200):**
```json
[
  {
    "user_id": "kullanıcı_id",
    "tag": "etiket_adı",
    "interaction_type": "etkileşim_türü",
    "interaction_count": 5,
    "last_interacted_at": "etkileşim_tarihi"
  },
  ...
]
```

### 3. Kullanıcının Belirli Bir Etiket ile Etkileşimlerini Getirme

**Endpoint:** `GET /users/:userId/tags/:tag`

**Başarılı Yanıt (200):**
```json
[
  {
    "user_id": "kullanıcı_id",
    "tag": "etiket_adı",
    "interaction_type": "etkileşim_türü",
    "interaction_count": 3,
    "last_interacted_at": "etkileşim_tarihi"
  },
  ...
]
```

### 4. Popüler Etiketleri Getirme

**Endpoint:** `GET /tags/popular`

**Parametreler:**
- `limit` (isteğe bağlı): Kaç tane etiket getirileceği (varsayılan: 10)

**Başarılı Yanıt (200):**
```json
[
  {
    "tag": "etiket_adı",
    "total_interactions": 150
  },
  ...
]
```

## Hata Durumları

- **400 Bad Request**: Eksik veya geçersiz parametreler
- **500 Internal Server Error**: Sunucu taraflı hatalar

## Veritabanı Şeması

Etkileşimler `User_Tag_Interactions` tablosunda saklanır ve aşağıdaki alanları içerir:
- `user_id`: Kullanıcı kimliği
- `tag`: Etkileşime geçilen etiket
- `interaction_type`: Etkileşim türü
- `interaction_count`: Etkileşim sayısı
- `last_interacted_at`: Son etkileşim tarihi
