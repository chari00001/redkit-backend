# Community Service API

**Base URL**: `http://localhost:3003/api/communities`

---

## 📋 Endpoints

### 1. Tüm Toplulukları Getir
```
GET /api/communities
```

**Query Parameters:**
- `page`: sayfa numarası (default: 1)
- `limit`: sayfa başına kayıt (default: 10)
- `name`: topluluk adında arama
- `sort`: newest|oldest|members|posts

**Response:**
```json
{
  "communities": [
    {
      "id": 1,
      "name": "Teknoloji",
      "description": "Teknoloji tartışmaları",
      "visibility": "public",
      "member_count": 150,
      "post_count": 45,
      "cover_image_url": "https://example.com/cover.jpg",
      "creator": {
        "id": 3,
        "username": "cagri"
      }
    }
  ],
  "totalCount": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

---

### 2. Topluluk Detayı
```
GET /api/communities/:id
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)

**Response:**
```json
{
  "id": 1,
  "name": "Teknoloji",
  "description": "Teknoloji tartışmaları",
  "visibility": "public",
  "member_count": 150,
  "post_count": 45,
  "rules": "1. Saygılı olun\n2. Spam yapmayın",
  "tags": ["tech", "programming"],
  "cover_image_url": "https://example.com/cover.jpg",
  "creator": {
    "id": 3,
    "username": "cagri"
  }
}
```

---

### 3. Topluluk Oluştur
```
POST /api/communities
```

**Request:**
```json
{
  "name": "Yeni Topluluk",
  "description": "Açıklama",
  "visibility": "public",
  "rules": "Kurallar",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "message": "Topluluk başarıyla oluşturuldu",
  "community": {
    "id": 2,
    "name": "Yeni Topluluk",
    "member_count": 1
  }
}
```

---

### 4. Topluluk Güncelle
```
PUT /api/communities/:id
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)

**Request:**
```json
{
  "description": "Yeni açıklama",
  "rules": "Yeni kurallar",
  "tags": ["yeni", "etiketler"]
}
```

---

### 5. Topluluğa Katıl
```
POST /api/communities/:id/join
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)

**Response:**
```json
{
  "message": "Topluluğa başarıyla katıldınız"
}
```

---

### 6. Topluluktan Ayrıl
```
POST /api/communities/:id/leave
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)

**Response:**
```json
{
  "message": "Topluluktan başarıyla ayrıldınız"
}
```

---

### 7. Topluluk Üyeleri
```
GET /api/communities/:id/members
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)

**Query Parameters:**
- `page`: sayfa numarası
- `limit`: sayfa başına kayıt
- `role`: member|moderator|admin

**Response:**
```json
{
  "members": [
    {
      "user_id": 3,
      "role": "admin",
      "joined_at": "2025-05-24T17:00:00.000Z",
      "User": {
        "id": 3,
        "username": "cagri"
      }
    }
  ],
  "totalCount": 150,
  "currentPage": 1
}
```

---

### 8. Kullanıcının Toplulukları
```
GET /api/communities/user/:userId
```

**Response:**
```json
{
  "communities": [
    {
      "id": 1,
      "name": "Teknoloji",
      "member_count": 150,
      "cover_image_url": "https://example.com/cover.jpg"
    }
  ],
  "totalCount": 5
}
```

---

### 9. Topluluk Postları ⭐ **YENİ**
```
GET /api/communities/:id/posts
```

**Parameters:**
- `id`: Topluluk ID'si (number) veya adı (string)
  - Örnek: `/api/communities/10/posts` (ID ile)
  - Örnek: `/api/communities/DevCorner/posts` (isim ile)

**Query Parameters:**
- `page`: sayfa numarası (default: 1)
- `limit`: sayfa başına kayıt (default: 10)
- `sort`: newest|oldest|popular

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Yeni Teknoloji Trendi",
      "content": "Bu yıl dikkat çeken teknolojiler...",
      "user_id": 3,
      "media_url": "http://localhost:3002/static/uploads/images/example.jpg",
      "likes_count": 25,
      "comments_count": 8,
      "views_count": 150,
      "visibility": "public",
      "tags": ["teknoloji", "ai"],
      "created_at": "2025-05-24T17:00:00.000Z"
    }
  ],
  "totalCount": 45,
  "totalPages": 5,
  "currentPage": 1,
  "community": {
    "id": 1,
    "name": "Teknoloji",
    "description": "Teknoloji tartışmaları",
    "member_count": 150
  }
}
```

---

## 🔧 JavaScript Örnekleri

### Toplulukları Getir
```javascript
const getCommunities = async (page = 1) => {
  const response = await fetch(`http://localhost:3003/api/communities?page=${page}`);
  const data = await response.json();
  return data.communities;
};
```

### Topluluk Oluştur
```javascript
const createCommunity = async (communityData) => {
  const response = await fetch('http://localhost:3003/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(communityData)
  });
  return await response.json();
};
```

### Topluluğa Katıl (ID veya Name ile)
```javascript
const joinCommunity = async (communityIdOrName) => {
  const response = await fetch(`http://localhost:3003/api/communities/${communityIdOrName}/join`, {
    method: 'POST'
  });
  return await response.json();
};

// Kullanım örnekleri:
// await joinCommunity(10);           // ID ile
// await joinCommunity('DevCorner');  // Name ile
```

### Topluluk Postlarını Getir ⭐ **YENİ**
```javascript
const getCommunityPosts = async (communityIdOrName, page = 1, limit = 10) => {
  const response = await fetch(
    `http://localhost:3003/api/communities/${communityIdOrName}/posts?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data;
};

// Kullanım örnekleri:
// await getCommunityPosts(10);           // ID ile
// await getCommunityPosts('DevCorner');  // Name ile
// await getCommunityPosts('TechTalks', 2, 5); // Name, sayfa ve limit ile
```

### Topluluk Detayı Getir (Flexible)
```javascript
const getCommunityDetails = async (communityIdOrName) => {
  const response = await fetch(`http://localhost:3003/api/communities/${communityIdOrName}`);
  const data = await response.json();
  return data;
};

// Her iki şekilde de çalışır:
// await getCommunityDetails(10);         // ID ile
// await getCommunityDetails('DevCorner'); // Name ile
```

---

## ⚠️ Hata Kodları

- **400**: Geçersiz istek
- **401**: Giriş gerekli
- **403**: Yetki yok (özel topluluk erişimi)
- **404**: Topluluk bulunamadı
- **500**: Sunucu hatası

---

## 🆕 Yeni Özellikler

### ✅ **Flexible ID/Name Support**
Artık tüm endpoint'lerde topluluk ID'si yerine topluluk adını da kullanabilirsiniz:
- `/api/communities/10` → `/api/communities/DevCorner`
- `/api/communities/10/posts` → `/api/communities/DevCorner/posts`
- `/api/communities/10/join` → `/api/communities/DevCorner/join`

### ✅ **Community Posts Endpoint**
Yeni `/posts` endpoint'i ile topluluk postlarını getirebilirsiniz:
- Sayfalama desteği
- Sıralama seçenekleri
- Community bilgileri dahil
- Microservice entegrasyonu

### ✅ **Error Handling**
- Graceful fallback mekanizması
- Post service erişilemezse boş sonuç döndürür
- Detaylı hata mesajları

---

## 📝 Notlar

- Test ortamında authentication otomatik
- Özel topluluklar sadece üyeler görebilir
- Topluluk yaratıcısı otomatik admin olur
- **YENİ**: Topluluk adları büyük/küçük harf duyarlı
- **YENİ**: Post service ile microservice iletişimi
- **YENİ**: Flexible ID/Name desteği tüm endpoint'lerde
