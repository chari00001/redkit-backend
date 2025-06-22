const db = require("../db");

// Etkileşim türlerini sabit olarak tanımlıyoruz
const INTERACTION_TYPES = {
  LIKE: "like",
  VIEW: "view",
  SHARE: "share",
  COMMENT: "comment",
};

// Kullanıcı-tag etkileşimleri için model fonksiyonları
const userTagInteractionModel = {
  // Yeni etkileşim ekleme ya da mevcut etkileşimi güncelleme
  async addOrUpdateInteraction(userId, tag, interactionType) {
    // Etkileşim türü geçerli mi kontrol et
    if (!Object.values(INTERACTION_TYPES).includes(interactionType)) {
      throw new Error(`Geçersiz etkileşim türü: ${interactionType}`);
    }

    try {
      // Etkileşimi ekleme veya güncelleme (UPSERT işlemi)
      const result = await db.query(
        `INSERT INTO user_tag_interactions 
         (user_id, tag, interaction_type, interaction_count, last_interacted_at) 
         VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, tag, interaction_type) 
         DO UPDATE SET 
           interaction_count = user_tag_interactions.interaction_count + 1, 
           last_interacted_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, tag, interactionType]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Etkileşim ekleme/güncelleme hatası:", error);
      throw error;
    }
  },

  // Kullanıcının belirli bir etkileşim türüne göre etkileşimlerini getirme
  async getUserInteractionsByType(userId, interactionType) {
    try {
      const result = await db.query(
        `SELECT * FROM user_tag_interactions 
         WHERE user_id = $1 AND interaction_type = $2
         ORDER BY interaction_count DESC, last_interacted_at DESC`,
        [userId, interactionType]
      );
      return result.rows;
    } catch (error) {
      console.error("Kullanıcı etkileşimleri getirme hatası:", error);
      throw error;
    }
  },

  // Kullanıcının tüm etkileşimlerini getirme
  async getAllUserInteractions(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM user_tag_interactions 
         WHERE user_id = $1
         ORDER BY interaction_count DESC, last_interacted_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Kullanıcı etkileşimleri getirme hatası:", error);
      throw error;
    }
  },

  // En popüler etiketleri getirme
  async getPopularTags(limit = 10) {
    try {
      const result = await db.query(
        `SELECT tag, SUM(interaction_count) as total_interactions
         FROM user_tag_interactions
         GROUP BY tag
         ORDER BY total_interactions DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Popüler etiketleri getirme hatası:", error);
      throw error;
    }
  },

  // Kullanıcının belirli bir etiket ile etkileşimlerini getirme
  async getUserTagInteractions(userId, tag) {
    try {
      const result = await db.query(
        `SELECT * FROM user_tag_interactions 
         WHERE user_id = $1 AND tag = $2
         ORDER BY interaction_count DESC`,
        [userId, tag]
      );
      return result.rows;
    } catch (error) {
      console.error("Kullanıcı-etiket etkileşimleri getirme hatası:", error);
      throw error;
    }
  },
};

module.exports = {
  userTagInteractionModel,
  INTERACTION_TYPES,
};
