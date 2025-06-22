# Post Service API Dokümantasyonu

Bu doküman, post servisinin tüm endpoint'lerini ve kullanım şekillerini açıklamaktadır.

## Base URL
```
/api/posts
```

## Kimlik Doğrulama
Çoğu endpoint, kimlik doğrulama gerektirmektedir. İstek header'ında `Authorization: Bearer <token>` şeklinde token gönderilmelidir.

---

## Post Endpoint'leri

### 1. Yeni Post Oluştur
**Endpoint:** `POST /`  
**Kimlik Doğrulama:** Gerekli

#### Request Body:
```json
{
  "title": "string", // Zorunlu
  "content": "string", // Zorunlu
  "media_url": "string", // Opsiyonel, geçerli URL olmalı
  "visibility": "public|private|followers", // Varsayılan: "public"
  "tags": ["tag1", "tag2"], // Dizi olmalı
  "allow_comments": true // Boolean, varsayılan: true
}
```

#### Response:
```json
{
  "success": true,
  "message": "Post başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "user_id": 3,
    "title": "Örnek Başlık",
    "content": "Örnek içerik",
    "media_url": "https://example.com/image.jpg",
    "visibility": "public",
    "tags": ["teknoloji", "yazılım"],
    "allow_comments": true,
    "likes_count": 0,
    "comments_count": 0,
    "shares_count": 0,
    "views_count": 0,
    "is_pinned": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.1. Resim ile Birlikte Post Oluştur
**Endpoint:** `POST /with-image`  
**Kimlik Doğrulama:** Gerekli  
**Content-Type:** `multipart/form-data`

#### Request Body (Form Data):
- `title`: string (Zorunlu)
- `content`: string (Zorunlu)
- `image`: Resim dosyası (Opsiyonel - JPEG, PNG, GIF, WebP, max 5MB)
- `visibility`: "public|private|followers" (Opsiyonel, varsayılan: "public")
- `tags`: JSON string, örn: `'["tag1", "tag2"]'` (Opsiyonel)
- `allow_comments`: boolean (Opsiyonel, varsayılan: true)

#### Response:
```json
{
  "success": true,
  "message": "Post başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "user_id": 3,
    "title": "Resimli Post",
    "content": "Bu post bir resim içeriyor",
    "media_url": "http://localhost:3002/uploads/images/image_1640995200000_123456789.jpg",
    "visibility": "public",
    "tags": ["resim", "fotoğraf"],
    "allow_comments": true,
    "likes_count": 0,
    "comments_count": 0,
    "shares_count": 0,
    "views_count": 0,
    "is_pinned": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Örnek JavaScript Kullanımı:
```javascript
const formData = new FormData();
formData.append('title', 'Resimli Post');
formData.append('content', 'Bu post bir resim içeriyor');
formData.append('image', fileInput.files[0]);
formData.append('tags', JSON.stringify(['resim', 'fotoğraf']));
formData.append('visibility', 'public');
formData.append('allow_comments', 'true');

const response = await fetch('/api/posts/with-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**Not:** Bu endpoint resim yükleme ve post oluşturmayı tek işlemde yapar.

### 2. Post Güncelle
**Endpoint:** `PUT /:id`  
**Kimlik Doğrulama:** Gerekli  
**Not:** Yalnızca post sahibi güncelleyebilir

#### Request Body:
```json
{
  "title": "string", // Opsiyonel
  "content": "string", // Opsiyonel
  "media_url": "string", // Opsiyonel
  "visibility": "public|private|followers", // Opsiyonel
  "tags": ["tag1", "tag2"], // Opsiyonel
  "allow_comments": true // Opsiyonel
}
```

#### Response:
```json
{
  "success": true,
  "message": "Post başarıyla güncellendi",
  "data": {
    // Güncellenmiş post verisi
  }
}
```

### 3. Post Sil
**Endpoint:** `DELETE /:id`  
**Kimlik Doğrulama:** Gerekli  
**Not:** Yalnızca post sahibi silebilir

#### Response:
```json
{
  "success": true,
  "message": "Post başarıyla silindi"
}
```

### 4. Tekil Post Getir
**Endpoint:** `GET /:id`  
**Kimlik Doğrulama:** Opsiyonel (private postlar için gerekli)

#### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 3,
    "title": "Örnek Başlık",
    "content": "Örnek içerik",
    "media_url": "https://example.com/image.jpg",
    "visibility": "public",
    "tags": ["teknoloji", "yazılım"],
    "allow_comments": true,
    "likes_count": 5,
    "comments_count": 3,
    "shares_count": 2,
    "views_count": 100,
    "is_pinned": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Not:** Bu endpoint çağrıldığında post'un `views_count` değeri otomatik olarak 1 artırılır.

### 5. Post Listesi
**Endpoint:** `GET /`  
**Kimlik Doğrulama:** Opsiyonel

#### Query Parameters:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına post sayısı (varsayılan: 10)
- `visibility`: Görünürlük filtresi (`public`, `private`)
- `userId`: Belirli kullanıcının postları
- `tag`: Etiket filtresi

#### Örnek Request:
```
GET /?page=1&limit=10&visibility=public&tag=teknoloji
```

#### Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        // Post verisi
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5
    }
  }
}
```

### 6. Kullanıcının Postlarını Getir
**Endpoint:** `GET /user/:userId`  
**Kimlik Doğrulama:** Opsiyonel

#### Query Parameters:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına post sayısı (varsayılan: 10)
- `visibility`: Görünürlük filtresi (`public`, `private`, `all`)

#### Örnek Request:
```
GET /user/123?page=1&limit=10&visibility=public
```

#### Response:
```json
{
  "success": true,
  "data": {
    "posts": [], // Kullanıcının postu yoksa boş array döndürülür
    "pagination": {
      "total": 0,
      "page": 1,
      "pages": 0
    }
  }
}
```

**Not:** 
- Kullanıcı kendi postlarını görüyorsa `visibility=all` ile tüm görünürlük seviyelerindeki postları görebilir
- Başka birinin postlarını görüyorsa sadece `public` postlar görüntülenir
- Kullanıcının hiç postu yoksa 404 yerine boş array (`[]`) döndürülür

### 7. Post Beğen/Beğenmekten Vazgeç
**Endpoint:** `POST /:id/like`  
**Kimlik Doğrulama:** Gerekli

#### Response:
```json
{
  "success": true,
  "message": "Post beğenildi" // veya "Post beğenisi kaldırıldı"
}
```

**Not:** Eğer kullanıcı daha önce beğenmişse beğeni kaldırılır, beğenmemişse beğeni eklenir.

### 8. Post Paylaş
**Endpoint:** `POST /:id/share`  
**Kimlik Doğrulama:** Gerekli

#### Response:
```json
{
  "success": true,
  "message": "Post başarıyla paylaşıldı"
}
```

**Not:** Bu endpoint post'un `shares_count` değerini 1 artırır.

### 9. Resim Yükle
**Endpoint:** `POST /upload-image`  
**Kimlik Doğrulama:** Gerekli  
**Content-Type:** `multipart/form-data`

#### Request Body (Form Data):
- `image`: Resim dosyası (JPEG, PNG, GIF, WebP)
- **Maksimum dosya boyutu:** 5MB
- **İzin verilen formatlar:** JPEG, JPG, PNG, GIF, WebP

#### Response:
```json
{
  "success": true,
  "message": "Resim başarıyla yüklendi",
  "data": {
    "filename": "image_1640995200000_123456789.jpg",
    "originalName": "my-photo.jpg",
    "size": 1048576,
    "url": "http://localhost:3002/uploads/images/image_1640995200000_123456789.jpg"
  }
}
```

#### Hata Durumları:
- **400:** Dosya boyutu çok büyük (>5MB)
- **400:** Desteklenmeyen dosya formatı
- **400:** Dosya seçilmedi

#### Kullanım:
1. Önce resmi bu endpoint'e yükleyin
2. Dönen `url`'yi post oluştururken `media_url` alanında kullanın

#### Örnek JavaScript Kullanımı:
```javascript
// 1. Resim yükle
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const uploadResponse = await fetch('/api/posts/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const uploadData = await uploadResponse.json();

// 2. Post oluştur
const postResponse = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Resimli Post',
    content: 'Bu post bir resim içeriyor',
    media_url: uploadData.data.url, // Yüklenen resimin URL'si
    tags: ['resim', 'fotoğraf'],
    visibility: 'public',
    allow_comments: true
  })
});
```

---

## Yorum Endpoint'leri

### 1. Post Yorumlarını Getir
**Endpoint:** `GET /:postId/comments`  
**Kimlik Doğrulama:** Gerekli

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "content": "Harika bir post!",
      "parent_id": null,
      "anonymous": false,
      "likes_count": 3,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Yorum Oluştur
**Endpoint:** `POST /:postId/comments`  
**Kimlik Doğrulama:** Gerekli

#### Request Body:
```json
{
  "content": "string", // Zorunlu
  "parent_id": 1, // Opsiyonel, alt yorum için
  "anonymous": false // Opsiyonel, anonim yorum için
}
```

#### Response:
```json
{
  "success": true,
  "message": "Yorum başarıyla oluşturuldu",
  "data": {
    // Oluşturulan yorum verisi
  }
}
```

### 3. Yorum Güncelle
**Endpoint:** `PUT /:postId/comments/:commentId`  
**Kimlik Doğrulama:** Gerekli  
**Not:** Yalnızca yorum sahibi güncelleyebilir

#### Request Body:
```json
{
  "content": "string" // Zorunlu
}
```

#### Response:
```json
{
  "success": true,
  "message": "Yorum başarıyla güncellendi",
  "data": {
    // Güncellenmiş yorum verisi
  }
}
```

### 4. Yorum Sil
**Endpoint:** `DELETE /:postId/comments/:commentId`  
**Kimlik Doğrulama:** Gerekli  
**Not:** Yalnızca yorum sahibi silebilir

#### Response:
```json
{
  "success": true,
  "message": "Yorum başarıyla silindi"
}
```

### 5. Yorum Beğen/Beğenmekten Vazgeç
**Endpoint:** `POST /:postId/comments/:commentId/like`  
**Kimlik Doğrulama:** Gerekli

#### Response:
```json
{
  "success": true,
  "message": "Yorum beğenildi" // veya "Yorum beğenisi kaldırıldı"
}
```

---

## Hata Kodları

### 400 - Bad Request
- Geçersiz request body
- Validasyon hataları

### 401 - Unauthorized
- Geçersiz veya eksik token

### 403 - Forbidden
- Yetkisiz işlem (başkasının postunu/yorumunu düzenleme/silme)

### 404 - Not Found
- Post veya yorum bulunamadı

### 500 - Internal Server Error
- Sunucu hatası

---

## Veri Modeli

### Post Modeli
```javascript
{
  id: Integer, // Primary key
  user_id: Integer, // Foreign key
  title: String(255), // Zorunlu
  content: Text,
  media_url: String(255),
  visibility: Enum("public", "private", "followers"), // Varsayılan: "public"
  tags: JSONB, // Etiket dizisi
  allow_comments: Boolean, // Varsayılan: true
  is_pinned: Boolean, // Varsayılan: false
  likes_count: Integer, // Varsayılan: 0
  comments_count: Integer, // Varsayılan: 0
  shares_count: Integer, // Varsayılan: 0
  views_count: Integer, // Varsayılan: 0
  created_at: Date,
  updated_at: Date
}
```

### Görünürlük Seviyeleri
- `public`: Herkese açık
- `private`: Sadece post sahibi görebilir
- `followers`: Sadece takipçiler görebilir

### Etiket Sistemi
Etiketler JSONB formatında dizi olarak saklanır:
```json
["teknoloji", "yazılım", "web"]
```

---

## Örnek Kullanım Senaryoları

### 1. Yeni Post Oluşturma
```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Yeni Teknoloji Trendleri',
    content: 'Bu yıl öne çıkan teknoloji trendleri...',
    tags: ['teknoloji', 'trend', '2024'],
    visibility: 'public',
    allow_comments: true
  })
});
```

### 2. Post Listesi Çekme
```javascript
const response = await fetch('/api/posts?page=1&limit=10&tag=teknoloji');
const data = await response.json();
```

### 3. Post Beğenme
```javascript
const response = await fetch(`/api/posts/${postId}/like`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### 4. Yorum Ekleme
```javascript
const response = await fetch(`/api/posts/${postId}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    content: 'Harika bir post, teşekkürler!',
    anonymous: false
  })
});
```
