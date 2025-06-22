#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Emoji tanımlamaları
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
LOADING="🔄"
POST="📝"
LIKE="👍"
VIEW="👁️"
COMMENT="💬"
SHARE="🔄"
LIST="📋"
DELETE="🗑️"
REPLY="↩️"
EDIT="✏️"

# Post servisi test scripti
# BASE_URL'i kendi ortamınıza göre ayarlayın
BASE_URL="http://localhost:3002/api/posts"
# Test sonuçlarını tutmak için dizi
results=()
POST_ID=""
COMMENT_ID=""
REPLY_ID=""

# === Test Hazırlık ===
# Test middleware'ı, API çağrılarında req.user = { id: 3, email: "cagri@gmail.com" } olarak ayarlanıyor

echo -e "${BOLD}${BLUE}🧪 Post Servisi API Testi Başlıyor...${NC}"
echo -e "${BLUE}==================================${NC}"

# 1. Post Oluşturma
echo -e "\n${BOLD}${POST} [1] /posts (POST) - Post Oluşturma${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Başlığı",
    "content": "Bu bir test içeriğidir.",
    "media_url": "http://example.com/image.jpg",
    "visibility": "public",
    "tags": ["test", "api"],
    "allow_comments": true
  }')
CREATE_SUCCESS=$(echo $CREATE_RESPONSE | jq -r '.success')
POST_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')

if [ "$CREATE_SUCCESS" == "true" ] && [ "$POST_ID" != "null" ] && [ "$POST_ID" != "" ]; then
  results+=("${GREEN}${CHECK} Post oluşturma başarılı (ID: $POST_ID)${NC}")
else
  error_message=$(echo $CREATE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post oluşturma başarısız: $error_message${NC}")
  # Eğer post oluşturma başarısız olursa, sonraki testler için varsayılan bir ID kullanabiliriz
  POST_ID="1" # varsayılan bir ID
  results+=("${YELLOW}${WARNING} Post oluşturma başarısız olduğu için varsayılan ID ($POST_ID) kullanılıyor${NC}")
fi

# 2. Post Listesi
echo -e "\n${BOLD}${LIST} [2] /posts (GET) - Post Listesi${NC}"
# HTTP durum kodu için -w kullanmak yerine, doğrudan JSON yanıtı analiz ediyoruz
LIST_RESPONSE=$(curl -s "$BASE_URL/")
LIST_SUCCESS=$(echo $LIST_RESPONSE | jq -r '.success')

if [ "$LIST_SUCCESS" == "true" ]; then
  posts_count=$(echo $LIST_RESPONSE | jq '.data.posts | length')
  results+=("${GREEN}${CHECK} Post listesi başarılı (Toplam: $posts_count)${NC}")
else
  error_message=$(echo $LIST_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post listesi başarısız: $error_message${NC}")
fi

# 3. Tekil Post Getirme
echo -e "\n${BOLD}${VIEW} [3] /posts/:id (GET) - Tekil Post${NC}"
# HTTP durum kodu için -w kullanmak yerine, doğrudan JSON yanıtı analiz ediyoruz
GET_RESPONSE=$(curl -s "$BASE_URL/$POST_ID")
GET_SUCCESS=$(echo $GET_RESPONSE | jq -r '.success')

if [ "$GET_SUCCESS" == "true" ]; then
  post_title=$(echo $GET_RESPONSE | jq -r '.data.title')
  results+=("${GREEN}${CHECK} Tekil post getirme başarılı (Başlık: $post_title)${NC}")
else
  error_message=$(echo $GET_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Tekil post getirme başarısız: $error_message${NC}")
fi

# 4. Post Güncelleme
echo -e "\n${BOLD}${POST} [4] /posts/:id (PUT) - Post Güncelleme${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Güncellenmiş Başlık",
    "content": "Bu içerik güncellendi.",
    "visibility": "private"
  }')
UPDATE_SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success')

if [ "$UPDATE_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Post güncelleme başarılı${NC}")
else
  error_message=$(echo $UPDATE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post güncelleme başarısız: $error_message${NC}")
fi

# 5. Post Beğenme
echo -e "\n${BOLD}${LIKE} [5] /posts/:id/like (POST) - Beğenme${NC}"
LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/like")
LIKE_SUCCESS=$(echo $LIKE_RESPONSE | jq -r '.success')

if [ "$LIKE_SUCCESS" == "true" ]; then
  message=$(echo $LIKE_RESPONSE | jq -r '.message')
  results+=("${GREEN}${CHECK} Post beğenme başarılı ($message)${NC}")
else
  error_message=$(echo $LIKE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post beğenme başarısız: $error_message${NC}")
fi

# 6. Post Beğenmekten Vazgeçme (Tekrar like endpoint'ini çağırarak)
echo -e "\n${BOLD}${LIKE} [6] /posts/:id/like (POST) - Beğeniden Vazgeçme${NC}"
UNLIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/like")
UNLIKE_SUCCESS=$(echo $UNLIKE_RESPONSE | jq -r '.success')

if [ "$UNLIKE_SUCCESS" == "true" ]; then
  message=$(echo $UNLIKE_RESPONSE | jq -r '.message')
  results+=("${GREEN}${CHECK} Post beğenmekten vazgeçme başarılı ($message)${NC}")
else
  error_message=$(echo $UNLIKE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post beğenmekten vazgeçme başarısız: $error_message${NC}")
fi

# 7. Post Paylaşma
echo -e "\n${BOLD}${SHARE} [7] /posts/:id/share (POST) - Paylaşma${NC}"
SHARE_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/share")
SHARE_SUCCESS=$(echo $SHARE_RESPONSE | jq -r '.success')

if [ "$SHARE_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Post paylaşma başarılı${NC}")
else
  error_message=$(echo $SHARE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post paylaşma başarısız: $error_message${NC}")
fi

# === YORUM TESTLERİ ===
echo -e "\n${BOLD}${BLUE}🧪 Yorum API Testleri${NC}"
echo -e "${BLUE}==================================${NC}"

# 8. Yorum Oluşturma
echo -e "\n${BOLD}${COMMENT} [8] /posts/:postId/comments (POST) - Yorum Oluşturma${NC}"
CREATE_COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bu bir test yorumudur.",
    "anonymous": false
  }')
CREATE_COMMENT_SUCCESS=$(echo $CREATE_COMMENT_RESPONSE | jq -r '.success')
COMMENT_ID=$(echo $CREATE_COMMENT_RESPONSE | jq -r '.data.id')

if [ "$CREATE_COMMENT_SUCCESS" == "true" ] && [ "$COMMENT_ID" != "null" ] && [ "$COMMENT_ID" != "" ]; then
  results+=("${GREEN}${CHECK} Yorum oluşturma başarılı (ID: $COMMENT_ID)${NC}")
else
  error_message=$(echo $CREATE_COMMENT_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorum oluşturma başarısız: $error_message${NC}")
  # Varsayılan bir ID kullan
  COMMENT_ID="1"
  results+=("${YELLOW}${WARNING} Yorum oluşturma başarısız olduğu için varsayılan ID ($COMMENT_ID) kullanılıyor${NC}")
fi

# 9. Yoruma Yanıt Oluşturma
echo -e "\n${BOLD}${REPLY} [9] /posts/:postId/comments (POST) - Yoruma Yanıt Oluşturma${NC}"
CREATE_REPLY_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"Bu bir yanıt yorumudur.\",
    \"parent_id\": $COMMENT_ID,
    \"anonymous\": false
  }")
CREATE_REPLY_SUCCESS=$(echo $CREATE_REPLY_RESPONSE | jq -r '.success')
REPLY_ID=$(echo $CREATE_REPLY_RESPONSE | jq -r '.data.id')

if [ "$CREATE_REPLY_SUCCESS" == "true" ] && [ "$REPLY_ID" != "null" ] && [ "$REPLY_ID" != "" ]; then
  results+=("${GREEN}${CHECK} Yanıt yorumu oluşturma başarılı (ID: $REPLY_ID)${NC}")
else
  error_message=$(echo $CREATE_REPLY_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yanıt yorumu oluşturma başarısız: $error_message${NC}")
  # Varsayılan bir ID kullan
  REPLY_ID="2"
  results+=("${YELLOW}${WARNING} Yanıt yorumu oluşturma başarısız olduğu için varsayılan ID ($REPLY_ID) kullanılıyor${NC}")
fi

# 10. Post için Yorumları Getirme
echo -e "\n${BOLD}${LIST} [10] /posts/:postId/comments (GET) - Yorumları Getirme${NC}"
GET_COMMENTS_RESPONSE=$(curl -s "$BASE_URL/$POST_ID/comments")
GET_COMMENTS_SUCCESS=$(echo $GET_COMMENTS_RESPONSE | jq -r '.success')

if [ "$GET_COMMENTS_SUCCESS" == "true" ]; then
  comments_count=$(echo $GET_COMMENTS_RESPONSE | jq '.data.comments | length')
  results+=("${GREEN}${CHECK} Yorumları getirme başarılı (Toplam: $comments_count)${NC}")
else
  error_message=$(echo $GET_COMMENTS_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorumları getirme başarısız: $error_message${NC}")
fi

# 11. Yoruma Yanıtları Getirme
echo -e "\n${BOLD}${LIST} [11] /posts/:postId/comments?parent_id=:commentId (GET) - Yoruma Yanıtları Getirme${NC}"
GET_REPLIES_RESPONSE=$(curl -s "$BASE_URL/$POST_ID/comments?parent_id=$COMMENT_ID")
GET_REPLIES_SUCCESS=$(echo $GET_REPLIES_RESPONSE | jq -r '.success')

if [ "$GET_REPLIES_SUCCESS" == "true" ]; then
  replies_count=$(echo $GET_REPLIES_RESPONSE | jq '.data.comments | length')
  results+=("${GREEN}${CHECK} Yoruma yanıtları getirme başarılı (Toplam: $replies_count)${NC}")
else
  error_message=$(echo $GET_REPLIES_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yoruma yanıtları getirme başarısız: $error_message${NC}")
fi

# 12. Yorum Güncelleme
echo -e "\n${BOLD}${EDIT} [12] /posts/:postId/comments/:commentId (PUT) - Yorum Güncelleme${NC}"
UPDATE_COMMENT_RESPONSE=$(curl -s -X PUT "$BASE_URL/$POST_ID/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bu yorum güncellendi."
  }')
UPDATE_COMMENT_SUCCESS=$(echo $UPDATE_COMMENT_RESPONSE | jq -r '.success')

if [ "$UPDATE_COMMENT_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Yorum güncelleme başarılı${NC}")
else
  error_message=$(echo $UPDATE_COMMENT_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorum güncelleme başarısız: $error_message${NC}")
fi

# 13. Yorum Beğenme
echo -e "\n${BOLD}${LIKE} [13] /posts/:postId/comments/:commentId/like (POST) - Yorum Beğenme${NC}"
LIKE_COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/comments/$COMMENT_ID/like")
LIKE_COMMENT_SUCCESS=$(echo $LIKE_COMMENT_RESPONSE | jq -r '.success')

if [ "$LIKE_COMMENT_SUCCESS" == "true" ]; then
  message=$(echo $LIKE_COMMENT_RESPONSE | jq -r '.message')
  results+=("${GREEN}${CHECK} Yorum beğenme başarılı ($message)${NC}")
else
  error_message=$(echo $LIKE_COMMENT_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorum beğenme başarısız: $error_message${NC}")
fi

# 14. Yorum Beğenmekten Vazgeçme
echo -e "\n${BOLD}${LIKE} [14] /posts/:postId/comments/:commentId/like (POST) - Yorum Beğenmekten Vazgeçme${NC}"
UNLIKE_COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/$POST_ID/comments/$COMMENT_ID/like")
UNLIKE_COMMENT_SUCCESS=$(echo $UNLIKE_COMMENT_RESPONSE | jq -r '.success')

if [ "$UNLIKE_COMMENT_SUCCESS" == "true" ]; then
  message=$(echo $UNLIKE_COMMENT_RESPONSE | jq -r '.message')
  results+=("${GREEN}${CHECK} Yorum beğenmekten vazgeçme başarılı ($message)${NC}")
else
  error_message=$(echo $UNLIKE_COMMENT_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorum beğenmekten vazgeçme başarısız: $error_message${NC}")
fi

# 15. Yorumu Silme
echo -e "\n${BOLD}${DELETE} [15] /posts/:postId/comments/:commentId (DELETE) - Yorumu Silme${NC}"
DELETE_COMMENT_RESPONSE=$(curl -s -X DELETE "$BASE_URL/$POST_ID/comments/$COMMENT_ID")
DELETE_COMMENT_SUCCESS=$(echo $DELETE_COMMENT_RESPONSE | jq -r '.success')

if [ "$DELETE_COMMENT_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Yorumu silme başarılı${NC}")
else
  error_message=$(echo $DELETE_COMMENT_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Yorumu silme başarısız: $error_message${NC}")
fi

# 16. Post Silme (En son yapılmalı)
echo -e "\n${BOLD}${DELETE} [16] /posts/:id (DELETE) - Post Silme${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/$POST_ID")
DELETE_SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')

if [ "$DELETE_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Post silme başarılı${NC}")
else
  error_message=$(echo $DELETE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post silme başarısız: $error_message${NC}")
fi

# 17. Silinen Postu Tekrar Getirmeyi Deneme (404 beklenir)
echo -e "\n${BOLD}${INFO} [17] /posts/:id (GET) - Silinmiş Post Kontrolü${NC}"
# HTTP durum kodunu almak için -o /dev/null ve -w kullanıyoruz
DELETED_GET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$POST_ID")

if [ "$DELETED_GET_STATUS" == "404" ]; then
  results+=("${GREEN}${CHECK} Silinen post kontrolü başarılı (404 Status Code)${NC}")
else
  results+=("${RED}${CROSS} Silinen post kontrolü başarısız (Beklenen: 404, Alınan: $DELETED_GET_STATUS)${NC}")
fi

# === Sonuçları Özetle ===
echo -e "\n${BLUE}====================${NC}"
echo -e "${BOLD}📊 Test Sonuçları:${NC}"
for result in "${results[@]}"; do
  echo -e "$result"
done
echo -e "${BLUE}====================${NC}"

# Test başarı durumunu kontrol et
SUCCESS_COUNT=$(echo "${results[@]}" | grep -o "${CHECK}" | wc -l)
FAIL_COUNT=$(echo "${results[@]}" | grep -o "${CROSS}" | wc -l)
WARN_COUNT=$(echo "${results[@]}" | grep -o "${WARNING}" | wc -l)
TOTAL_TESTS=$((SUCCESS_COUNT + FAIL_COUNT))

echo -e "${BOLD}Toplam Test:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Başarılı:${NC} $SUCCESS_COUNT"
echo -e "${RED}Başarısız:${NC} $FAIL_COUNT"
echo -e "${YELLOW}Uyarı:${NC} $WARN_COUNT"
echo -e "${BLUE}====================${NC}"

# Başarı oranını hesapla
if [ $TOTAL_TESTS -gt 0 ]; then
  SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_TESTS))
  echo -e "${BOLD}${BLUE}⭐ Başarı Oranı: %$SUCCESS_RATE${NC}"
  echo -e "${BLUE}====================${NC}"
fi

# Başarısız testler varsa, exit code 1 ile çık
if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
else
  exit 0
fi 