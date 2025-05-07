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
USER="👤"
LOCK="🔒"
EMAIL="📧"
NOTIFY="🔔"
FOLLOW="👥"
ADMIN="👑"
GEAR="⚙️"

PORT=3010
BASE_URL="http://localhost:$PORT/api/users"

# Benzersiz kullanıcı bilgileri oluştur
TIMESTAMP=$(date +%s)
USERNAME="testuser_${TIMESTAMP}"
EMAIL="test_${TIMESTAMP}@example.com"
PASSWORD="Parola123"
ADMIN_ID=1  # Admin kullanıcı ID'si

echo -e "${BOLD}${BLUE}🧪 API TESTİ${NC}"
echo -e "${USER} $USERNAME"
echo -e "${EMAIL} $EMAIL"
echo -e "${LOADING} $BASE_URL"

# Test sonuçlarını kaydet
SUCCESS=0
FAILURE=0
TOTAL_TESTS=15

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

# 1. Kullanıcı Kaydı
echo -e "\n${USER} Kullanıcı Kaydı"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
  success "Kayıt"
  # Verify token ve JWT token çıkar
  VERIFY_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"verifyToken":"[^"]*' | cut -d'"' -f4)
  JWT_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  failure "Kayıt: $(echo $REGISTER_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 2. Kullanıcı Girişi
echo -e "\n${LOCK} Kullanıcı Girişi"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  success "Giriş"
  # JWT token'ı güncelle
  JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  failure "Giriş: $(echo $LOGIN_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 3. Şifre Sıfırlama İsteği
echo -e "\n${LOCK} Şifre Sıfırlama"
FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\"
  }")

if [[ $FORGOT_RESPONSE == *"resetToken"* ]]; then
  success "Şifre sıfırlama isteği"
  # Reset token'ı çıkar
  RESET_TOKEN=$(echo $FORGOT_RESPONSE | grep -o '"resetToken":"[^"]*' | cut -d'"' -f4)
else
  failure "Şifre sıfırlama isteği: $(echo $FORGOT_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 4. Şifre Sıfırlama
if [ -n "$RESET_TOKEN" ]; then
  NEW_PASSWORD="YeniParola123_${TIMESTAMP}"
  RESET_RESPONSE=$(curl -s -X POST "$BASE_URL/reset-password" \
    -H "Content-Type: application/json" \
    -d "{
      \"token\": \"$RESET_TOKEN\",
      \"password\": \"$NEW_PASSWORD\"
    }")

  if [[ $RESET_RESPONSE == *"başarıyla"* ]]; then
    success "Şifre sıfırlama"
    PASSWORD="$NEW_PASSWORD"
  else
    failure "Şifre sıfırlama: $(echo $RESET_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  fi
else
  echo -e "${WARNING} Token yok, sıfırlama atlandı"
fi
progress

# 5. Hesap Doğrulama
echo -e "\n${USER} Hesap Doğrulama"
if [ -n "$VERIFY_TOKEN" ]; then
  VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/verify/$VERIFY_TOKEN")

  if [[ $VERIFY_RESPONSE == *"başarıyla doğrulandı"* ]]; then
    success "Hesap doğrulama"
  else
    failure "Hesap doğrulama: $(echo $VERIFY_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  fi
else
  echo -e "${WARNING} Token yok, doğrulama atlandı"
fi
progress

# JWT token kontrolü - yoksa tekrar giriş yapmayı dene
if [ -z "$JWT_TOKEN" ]; then
  echo -e "\n${LOADING} JWT token bulunamadı, tekrar giriş..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${CHECK} Giriş başarılı"
  else
    echo -e "${CROSS} Giriş başarısız"
    exit 1
  fi
fi

# 6. Profil Görüntüleme
echo -e "\n${USER} Profil Görüntüleme"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $PROFILE_RESPONSE == *"username"* ]]; then
  success "Profil görüntüleme"
else
  failure "Profil görüntüleme: $(echo $PROFILE_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 7. Profil Güncelleme
echo -e "\n${GEAR} Profil Güncelleme"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"bio\": \"Merhaba, ben ${USERNAME}\",
    \"location\": \"İstanbul\"
  }")

if [[ $UPDATE_RESPONSE == *"başarıyla güncellendi"* ]]; then
  success "Profil güncelleme"
else
  failure "Profil güncelleme: $(echo $UPDATE_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 8. Şifre Değiştirme
echo -e "\n${LOCK} Şifre Değiştirme"
NEW_PASSWORD="YeniParola456_${TIMESTAMP}"
PASSWORD_RESPONSE=$(curl -s -X PUT "$BASE_URL/me/password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"currentPassword\": \"$PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\"
  }")

if [[ $PASSWORD_RESPONSE == *"başarıyla değiştirildi"* ]]; then
  success "Şifre değiştirme"
  PASSWORD="$NEW_PASSWORD"
else
  failure "Şifre değiştirme: $(echo $PASSWORD_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 9. E-posta Değiştirme
echo -e "\n${EMAIL} E-posta Değiştirme"
NEW_EMAIL="yeni_${TIMESTAMP}@example.com"
EMAIL_RESPONSE=$(curl -s -X PUT "$BASE_URL/me/email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"password\": \"$PASSWORD\",
    \"newEmail\": \"$NEW_EMAIL\"
  }")

if [[ $EMAIL_RESPONSE == *"başarıyla değiştirildi"* ]]; then
  success "E-posta değiştirme"
  EMAIL="$NEW_EMAIL"
else
  failure "E-posta değiştirme: $(echo $EMAIL_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 10. Bildirim Ayarlarını Güncelleme
echo -e "\n${NOTIFY} Bildirim Ayarları"
NOTIFICATION_RESPONSE=$(curl -s -X PUT "$BASE_URL/me/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "email_notifications": true,
    "push_notifications": false
  }')

if [[ $NOTIFICATION_RESPONSE == *"başarıyla güncellendi"* ]]; then
  success "Bildirim ayarları"
else
  failure "Bildirim ayarları: $(echo $NOTIFICATION_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 11. Takipçileri Görüntüleme
echo -e "\n${FOLLOW} Takipçiler"
FOLLOWERS_RESPONSE=$(curl -s -X GET "$BASE_URL/followers" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $FOLLOWERS_RESPONSE == *"followers"* ]]; then
  success "Takipçiler görüntüleme"
else
  failure "Takipçiler görüntüleme: $(echo $FOLLOWERS_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 12. Takip Edilenleri Görüntüleme
echo -e "\n${FOLLOW} Takip Edilenler"
FOLLOWING_RESPONSE=$(curl -s -X GET "$BASE_URL/following" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $FOLLOWING_RESPONSE == *"following"* ]]; then
  success "Takip edilenler görüntüleme"
else
  failure "Takip edilenler görüntüleme: $(echo $FOLLOWING_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 13. Kullanıcı Takip Etme
echo -e "\n${FOLLOW} Kullanıcı Takip"
FOLLOW_RESPONSE=$(curl -s -X POST "$BASE_URL/follow/$ADMIN_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $FOLLOW_RESPONSE == *"başarıyla takip edildi"* || $FOLLOW_RESPONSE == *"zaten takip ediyorsunuz"* ]]; then
  success "Kullanıcı takip etme"
else
  failure "Kullanıcı takip etme: $(echo $FOLLOW_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 14. Kullanıcı Takibi Bırakma
echo -e "\n${FOLLOW} Takibi Bırak"
UNFOLLOW_RESPONSE=$(curl -s -X DELETE "$BASE_URL/follow/$ADMIN_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $UNFOLLOW_RESPONSE == *"takibi başarıyla bırakıldı"* || $UNFOLLOW_RESPONSE == *"takip etmiyorsunuz"* ]]; then
  success "Takibi bırakma"
else
  failure "Takibi bırakma: $(echo $UNFOLLOW_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
fi
progress

# 15. Admin - Tüm Kullanıcıları Listeleme
echo -e "\n${ADMIN} Admin İşlemi"
ADMIN_LIST_RESPONSE=$(curl -s -X GET "$BASE_URL" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [[ $ADMIN_LIST_RESPONSE == *"users"* ]]; then
  success "Admin listele"
else
  if [[ $ADMIN_LIST_RESPONSE == *"yetkiniz yok"* ]]; then
    success "Yetki kontrolü"
  else
    failure "Admin listele: $(echo $ADMIN_LIST_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  fi
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
