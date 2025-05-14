#!/bin/bash

# Topluluk API'leri için curl test scripti
# Gerekli değişkenleri ayarlayın
COMMUNITY_BASE_URL="http://localhost:3002/api/communities"
# Test token'ı
TOKEN=""eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3MjEwNzcyLCJleHAiOjE3NDcyOTcxNzJ9.jKHkiK7mi6pk3wgYASRN3iVjFfxPkeK-SnemoDQo4MU""

# Format için renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Test sonuçlarını tutmak için dizi
results=()

# === TOPLULUK SERVİSİ API TESTLERİ ===
echo -e "\n${GREEN}=== TOPLULUK SERVİSİ API TESTLERİ ===${NC}"

# Tüm toplulukları getir
test_get_all_communities() {
  echo -e "\n[1] Tüm Toplulukları Getir"
  COMMUNITIES_RESPONSE=$(curl -s -X GET "$COMMUNITY_BASE_URL")
  
  echo "$COMMUNITIES_RESPONSE" | jq '.'
  
  if [[ $(echo "$COMMUNITIES_RESPONSE" | jq -r '.communities') != "null" ]]; then
    results+=("${GREEN}✅ Tüm topluluklar getirildi${NC}")
  else
    results+=("${RED}❌ Topluluklar getirilemedi: $(echo "$COMMUNITIES_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluk oluştur
test_create_community() {
  echo -e "\n[2] Topluluk Oluştur"
  COMMUNITY_NAME="Test-Community-$(date +%s)"
  CREATE_RESPONSE=$(curl -s -X POST "$COMMUNITY_BASE_URL/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$COMMUNITY_NAME\",\"description\":\"Bu bir test topluluğudur\",\"visibility\":\"public\",\"rules\":\"Topluluk kuralları burada yer alacak\",\"tags\":\"[\\\"teknoloji\\\", \\\"yazılım\\\", \\\"test\\\"]\",\"is_featured\":false,\"cover_image_url\":\"https://example.com/cover-image.jpg\"}")
  
  echo "$CREATE_RESPONSE" | jq '.'
  
  # Topluluk ID'sini al
  COMMUNITY_ID=$(echo "$CREATE_RESPONSE" | jq -r '.community.id')
  
  if [[ "$COMMUNITY_ID" != "null" && "$COMMUNITY_ID" != "" ]]; then
    results+=("${GREEN}✅ Topluluk oluşturuldu (ID: $COMMUNITY_ID)${NC}")
    echo "Oluşturulan topluluk ID: $COMMUNITY_ID"
    # ID'yi sonraki testler için sakla
    echo "$COMMUNITY_ID" > /tmp/community_id.txt
  else
    results+=("${RED}❌ Topluluk oluşturulamadı: $(echo "$CREATE_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluk detaylarını getir
test_get_community_by_id() {
  echo -e "\n[3] Topluluk Detaylarını Getir"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluk detayları atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  COMMUNITY_RESPONSE=$(curl -s -X GET "$COMMUNITY_BASE_URL/$COMMUNITY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$COMMUNITY_RESPONSE" | jq '.'
  
  if [[ $(echo "$COMMUNITY_RESPONSE" | jq -r '.id') != "null" ]]; then
    results+=("${GREEN}✅ Topluluk detayları getirildi${NC}")
  else
    results+=("${RED}❌ Topluluk detayları getirilemedi: $(echo "$COMMUNITY_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluk güncelle
test_update_community() {
  echo -e "\n[4] Topluluk Güncelle"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluk güncelleme atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  UPDATE_RESPONSE=$(curl -s -X PUT "$COMMUNITY_BASE_URL/$COMMUNITY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"description\":\"Güncellenmiş açıklama\",\"rules\":\"Güncellenmiş kurallar\"}")
  
  echo "$UPDATE_RESPONSE" | jq '.'
  
  if [[ $(echo "$UPDATE_RESPONSE" | jq -r '.message') == *"güncellendi"* ]]; then
    results+=("${GREEN}✅ Topluluk güncellendi${NC}")
  else
    results+=("${RED}❌ Topluluk güncellenemedi: $(echo "$UPDATE_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluğa katıl
test_join_community() {
  echo -e "\n[5] Topluluğa Katıl"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluğa katılma atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  JOIN_RESPONSE=$(curl -s -X POST "$COMMUNITY_BASE_URL/$COMMUNITY_ID/join" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$JOIN_RESPONSE" | jq '.'
  
  if [[ $(echo "$JOIN_RESPONSE" | jq -r '.message') == *"katıl"* ]]; then
    results+=("${GREEN}✅ Topluluğa katılındı${NC}")
  else
    results+=("${RED}❌ Topluluğa katılınamadı: $(echo "$JOIN_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluk üyelerini getir
test_get_community_members() {
  echo -e "\n[6] Topluluk Üyelerini Getir"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluk üyeleri getirme atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  MEMBERS_RESPONSE=$(curl -s -X GET "$COMMUNITY_BASE_URL/$COMMUNITY_ID/members" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$MEMBERS_RESPONSE" | jq '.'
  
  if [[ $(echo "$MEMBERS_RESPONSE" | jq -r '.members') != "null" ]]; then
    results+=("${GREEN}✅ Topluluk üyeleri getirildi${NC}")
  else
    results+=("${RED}❌ Topluluk üyeleri getirilemedi: $(echo "$MEMBERS_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Kullanıcının üye olduğu toplulukları getir
test_get_user_communities() {
  echo -e "\n[7] Kullanıcının Toplulukları"
  USER_COMMUNITIES_RESPONSE=$(curl -s -X GET "$COMMUNITY_BASE_URL/user" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$USER_COMMUNITIES_RESPONSE" | jq '.'
  
  if [[ $(echo "$USER_COMMUNITIES_RESPONSE" | jq -r '.communities') != "null" ]]; then
    results+=("${GREEN}✅ Kullanıcının toplulukları getirildi${NC}")
  else
    results+=("${RED}❌ Kullanıcının toplulukları getirilemedi: $(echo "$USER_COMMUNITIES_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Üye rolünü güncelle
test_update_member_role() {
  echo -e "\n[8] Üye Rolünü Güncelle"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Üye rolü güncelleme atlandı (Topluluk ID bulunamadı)${NC}")
    return
  fi
  
  USER_ID=2  # Güncellenecek kullanıcı ID'si
  
  ROLE_RESPONSE=$(curl -s -X PUT "$COMMUNITY_BASE_URL/$COMMUNITY_ID/members/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"role\":\"moderator\"}")
  
  echo "$ROLE_RESPONSE" | jq '.'
  
  if [[ $(echo "$ROLE_RESPONSE" | jq -r '.message') == *"güncellendi"* ]]; then
    results+=("${GREEN}✅ Üye rolü güncellendi${NC}")
  else
    results+=("${RED}❌ Üye rolü güncellenemedi: $(echo "$ROLE_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluktan ayrıl
test_leave_community() {
  echo -e "\n[9] Topluluktan Ayrıl"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluktan ayrılma atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  LEAVE_RESPONSE=$(curl -s -X POST "$COMMUNITY_BASE_URL/$COMMUNITY_ID/leave" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$LEAVE_RESPONSE" | jq '.'
  
  if [[ $(echo "$LEAVE_RESPONSE" | jq -r '.message') == *"ayrıl"* ]]; then
    results+=("${GREEN}✅ Topluluktan ayrılındı${NC}")
  else
    results+=("${RED}❌ Topluluktan ayrılınamadı: $(echo "$LEAVE_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Topluluğu sil
test_delete_community() {
  echo -e "\n[10] Topluluğu Sil"
  
  # Önceki testten topluluk ID'sini al
  COMMUNITY_ID=$(cat /tmp/community_id.txt 2>/dev/null || echo "")
  
  if [[ -z "$COMMUNITY_ID" ]]; then
    results+=("${YELLOW}⚠️ Topluluk silme atlandı (ID bulunamadı)${NC}")
    return
  fi
  
  DELETE_RESPONSE=$(curl -s -X DELETE "$COMMUNITY_BASE_URL/$COMMUNITY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$DELETE_RESPONSE" | jq '.'
  
  if [[ $(echo "$DELETE_RESPONSE" | jq -r '.message') == *"silindi"* ]]; then
    results+=("${GREEN}✅ Topluluk silindi${NC}")
  else
    results+=("${RED}❌ Topluluk silinemedi: $(echo "$DELETE_RESPONSE" | jq -r '.message')${NC}")
  fi
}

# Testleri çalıştır
run_tests() {
  echo -e "\n${GREEN}=== TOPLULUK SERVİSİ TESTLERİ BAŞLIYOR ===${NC}"
  
  # Topluluk servisi testleri
  test_get_all_communities
  test_create_community
  test_get_community_by_id
  test_update_community
  test_join_community
  test_get_community_members
  test_get_user_communities
  test_update_member_role
  test_leave_community
  test_delete_community
  
  # Sonuçları göster
  echo -e "\n${GREEN}=== TEST SONUÇLARI ===${NC}"
  for result in "${results[@]}"; do
    echo -e "$result"
  done
  
  echo -e "\n${GREEN}=== TEST TAMAMLANDI ===${NC}"
}

# Testleri çalıştır
run_tests 