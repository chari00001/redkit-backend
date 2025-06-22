#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # Reset renk

# Emoji tanımlamaları
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
LOADING="🔄"
INTERACTION="🔗"
TAG="🏷️"
POPULAR="🔥"
USER="👤"
STATS="📊"
HEART="❤️"
EYE="👁️"
SHARE="📤"
COMMENT="💬"

PORT=3005
BASE_URL="http://localhost:$PORT/api"

# Test verileri - gerçek user ID'leri kullan
USER_ID_1=1
USER_ID_2=2
TEST_TAG_1="teknoloji"
TEST_TAG_2="spor"
TEST_TAG_3="müzik"

echo -e "${BOLD}${BLUE}🧪 ETKİLEŞİM SERVİSİ API TESTİ${NC}"
echo -e "${INTERACTION} Base URL: $BASE_URL"
echo -e "${USER} Test Kullanıcıları: $USER_ID_1, $USER_ID_2"
echo -e "${TAG} Test Etiketleri: $TEST_TAG_1, $TEST_TAG_2, $TEST_TAG_3"

# Test sonuçlarını kaydet
SUCCESS=0
FAILURE=0
TOTAL_TESTS=12

# Başarı ve hata durumlarını kaydet
function success() {
  echo -e "${GREEN}${CHECK}${NC} $1"
  ((SUCCESS++))
}

function failure() {
  echo -e "${RED}${CROSS}${NC} $1"
  ((FAILURE++))
}

# İlerleme çubuğu
function progress() {
  PROGRESS=$((SUCCESS + FAILURE))
  PERCENT=$((PROGRESS * 100 / TOTAL_TESTS))
  COUNT=$((PROGRESS * 20 / TOTAL_TESTS))
  BAR=""
  
  for ((i=0; i<COUNT; i++)); do
    BAR="${BAR}█"
  done
  
  for ((i=COUNT; i<20; i++)); do
    BAR="${BAR}░"
  done
  
  echo -e "\r${BLUE}[${BAR}] ${PERCENT}%${NC} $((PROGRESS))/$TOTAL_TESTS"
}

# Servis sağlık kontrolü
echo -e "\n${LOADING} Servis Sağlık Kontrolü"
HEALTH_RESPONSE=$(curl -s -X GET "http://localhost:$PORT/health")

if [[ $HEALTH_RESPONSE == *"interaction-service"* ]]; then
  success "Servis çalışıyor"
else
  failure "Servis çalışmıyor - lütfen servisi başlatın"
  echo -e "${WARNING} Servisi başlatmak için: cd monorepo-root/services/interaction-service && npm start"
  exit 1
fi
progress

# 1. Like Etkileşimi Kaydetme
echo -e "\n${HEART} Like Etkileşimi"
LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_1,
    \"tag\": \"$TEST_TAG_1\",
    \"interactionType\": \"like\"
  }")

if [[ $LIKE_RESPONSE == *"user_id"* && $LIKE_RESPONSE == *"like"* ]]; then
  success "Like etkileşimi kaydedildi"
else
  failure "Like etkileşimi: $(echo $LIKE_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 2. View Etkileşimi Kaydetme
echo -e "\n${EYE} View Etkileşimi"
VIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_1,
    \"tag\": \"$TEST_TAG_1\",
    \"interactionType\": \"view\"
  }")

if [[ $VIEW_RESPONSE == *"user_id"* && $VIEW_RESPONSE == *"view"* ]]; then
  success "View etkileşimi kaydedildi"
else
  failure "View etkileşimi: $(echo $VIEW_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 3. Share Etkileşimi Kaydetme
echo -e "\n${SHARE} Share Etkileşimi"
SHARE_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_2,
    \"tag\": \"$TEST_TAG_2\",
    \"interactionType\": \"share\"
  }")

if [[ $SHARE_RESPONSE == *"user_id"* && $SHARE_RESPONSE == *"share"* ]]; then
  success "Share etkileşimi kaydedildi"
else
  failure "Share etkileşimi: $(echo $SHARE_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 4. Comment Etkileşimi Kaydetme
echo -e "\n${COMMENT} Comment Etkileşimi"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_2,
    \"tag\": \"$TEST_TAG_3\",
    \"interactionType\": \"comment\"
  }")

if [[ $COMMENT_RESPONSE == *"user_id"* && $COMMENT_RESPONSE == *"comment"* ]]; then
  success "Comment etkileşimi kaydedildi"
else
  failure "Comment etkileşimi: $(echo $COMMENT_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 5. Aynı Etkileşimi Tekrar Kaydetme (Count Artırma)
echo -e "\n${HEART} Tekrar Like (Count Artırma)"
REPEAT_LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_1,
    \"tag\": \"$TEST_TAG_1\",
    \"interactionType\": \"like\"
  }")

if [[ $REPEAT_LIKE_RESPONSE == *"interaction_count"* ]]; then
  COUNT=$(echo $REPEAT_LIKE_RESPONSE | grep -o '"interaction_count":[0-9]*' | cut -d':' -f2)
  if [ "$COUNT" -gt 1 ]; then
    success "Etkileşim sayısı artırıldı (Count: $COUNT)"
  else
    failure "Etkileşim sayısı artırılmadı"
  fi
else
  failure "Tekrar like: $(echo $REPEAT_LIKE_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 6. Geçersiz Etkileşim Türü Testi
echo -e "\n${WARNING} Geçersiz Etkileşim Türü"
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_1,
    \"tag\": \"$TEST_TAG_1\",
    \"interactionType\": \"invalid_type\"
  }")

if [[ $INVALID_RESPONSE == *"Geçersiz etkileşim türü"* ]]; then
  success "Geçersiz etkileşim türü kontrolü"
else
  failure "Geçersiz etkileşim türü kontrolü başarısız"
fi
progress

# 7. Kullanıcının Tüm Etkileşimlerini Getirme
echo -e "\n${USER} Kullanıcı Etkileşimleri"
USER_INTERACTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID_1/interactions")

if [[ $USER_INTERACTIONS_RESPONSE == *"user_id"* ]]; then
  success "Kullanıcı etkileşimleri getirildi"
else
  failure "Kullanıcı etkileşimleri: $(echo $USER_INTERACTIONS_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 8. Belirli Etkileşim Türüne Göre Filtreleme
echo -e "\n${HEART} Like Etkileşimleri Filtreleme"
LIKE_FILTER_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID_1/interactions?type=like")

if [[ $LIKE_FILTER_RESPONSE == *"like"* ]]; then
  success "Like etkileşimleri filtrelendi"
else
  failure "Like filtreleme: $(echo $LIKE_FILTER_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 9. Kullanıcının Belirli Etiket ile Etkileşimleri
echo -e "\n${TAG} Etiket Etkileşimleri"
TAG_INTERACTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID_1/tags/$TEST_TAG_1")

if [[ $TAG_INTERACTIONS_RESPONSE == *"user_id"* ]]; then
  success "Etiket etkileşimleri getirildi"
else
  failure "Etiket etkileşimleri: $(echo $TAG_INTERACTIONS_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 10. Popüler Etiketleri Getirme
echo -e "\n${POPULAR} Popüler Etiketler"
POPULAR_TAGS_RESPONSE=$(curl -s -X GET "$BASE_URL/tags/popular")

if [[ $POPULAR_TAGS_RESPONSE == *"tag"* && $POPULAR_TAGS_RESPONSE == *"total_interactions"* ]]; then
  success "Popüler etiketler getirildi"
else
  failure "Popüler etiketler: $(echo $POPULAR_TAGS_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 11. Limit ile Popüler Etiketler
echo -e "\n${POPULAR} Popüler Etiketler (Limit=5)"
LIMITED_POPULAR_RESPONSE=$(curl -s -X GET "$BASE_URL/tags/popular?limit=5")

if [[ $LIMITED_POPULAR_RESPONSE == *"tag"* ]]; then
  success "Limitli popüler etiketler getirildi"
else
  failure "Limitli popüler etiketler: $(echo $LIMITED_POPULAR_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 12. Eksik Parametre Testi
echo -e "\n${WARNING} Eksik Parametre Kontrolü"
MISSING_PARAM_RESPONSE=$(curl -s -X POST "$BASE_URL/interactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID_1,
    \"tag\": \"$TEST_TAG_1\"
  }")

if [[ $MISSING_PARAM_RESPONSE == *"zorunludur"* ]]; then
  success "Eksik parametre kontrolü"
else
  failure "Eksik parametre kontrolü başarısız"
fi
progress

# Özet çubuk grafiği
echo -e "\n\n${BOLD}📊 SONUÇ${NC}"
SUCCESS_BAR=""
FAILURE_BAR=""

for ((i=0; i<SUCCESS; i++)); do
  SUCCESS_BAR="${SUCCESS_BAR}█"
done

for ((i=0; i<FAILURE; i++)); do
  FAILURE_BAR="${FAILURE_BAR}█"
done

# Sonuç grafiği
echo -e "${GREEN}${CHECK} Başarılı ${SUCCESS}/${TOTAL_TESTS} ${SUCCESS_BAR}${NC}"
echo -e "${RED}${CROSS} Başarısız ${FAILURE}/${TOTAL_TESTS} ${FAILURE_BAR}${NC}"

# Başarı oranı
PERCENT=$((SUCCESS * 100 / TOTAL_TESTS))
echo -e "${BOLD}${BLUE}⭐ Başarı Oranı: ${PERCENT}%${NC}"

# Test edilen özellikler özeti
echo -e "\n${BOLD}${STATS} Test Edilen Özellikler:${NC}"
echo -e "${HEART} Like etkileşimi kaydetme"
echo -e "${EYE} View etkileşimi kaydetme"
echo -e "${SHARE} Share etkileşimi kaydetme"
echo -e "${COMMENT} Comment etkileşimi kaydetme"
echo -e "${INTERACTION} Etkileşim sayısı artırma"
echo -e "${WARNING} Geçersiz parametre kontrolü"
echo -e "${USER} Kullanıcı etkileşimleri listeleme"
echo -e "${TAG} Etiket bazlı etkileşimler"
echo -e "${POPULAR} Popüler etiketler"

if [ $FAILURE -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}🎉 TÜM TESTLER BAŞARILI!${NC}"
else
  echo -e "\n${YELLOW}${BOLD}⚠️  BAZI TESTLER BAŞARISIZ OLDU${NC}"
fi 