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

# Post servisi test scripti
# BASE_URL'i kendi ortamınıza göre ayarlayın
BASE_URL="http://localhost:3001/posts"
# Test sonuçlarını tutmak için dizi
results=()
POST_ID=""

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

# 8. Post Silme (En son yapılmalı)
echo -e "\n${BOLD}${DELETE} [8] /posts/:id (DELETE) - Silme${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/$POST_ID")
DELETE_SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')

if [ "$DELETE_SUCCESS" == "true" ]; then
  results+=("${GREEN}${CHECK} Post silme başarılı${NC}")
else
  error_message=$(echo $DELETE_RESPONSE | jq -r '.message // .error // "Bilinmeyen hata"')
  results+=("${RED}${CROSS} Post silme başarısız: $error_message${NC}")
fi

# 9. Silinen Postu Tekrar Getirmeyi Deneme (404 beklenir)
echo -e "\n${BOLD}${INFO} [9] /posts/:id (GET) - Silinmiş Post Kontrolü${NC}"
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