const {
  userTagInteractionModel,
  INTERACTION_TYPES,
} = require("../models/userTagInteractions");

const userTagInteractionController = {
  // Yeni etkileşim ekleme veya mevcut etkileşimi güncelleme
  async recordInteraction(req, res) {
    try {
      const { userId, tag, interactionType } = req.body;

      // Gerekli alanların kontrolü
      if (!userId || !tag || !interactionType) {
        return res
          .status(400)
          .json({
            error: "userId, tag ve interactionType alanları zorunludur",
          });
      }

      // Etkileşim türü geçerli mi kontrolü
      if (!Object.values(INTERACTION_TYPES).includes(interactionType)) {
        return res
          .status(400)
          .json({
            error: `Geçersiz etkileşim türü. Geçerli türler: ${Object.values(
              INTERACTION_TYPES
            ).join(", ")}`,
          });
      }

      const result = await userTagInteractionModel.addOrUpdateInteraction(
        userId,
        tag,
        interactionType
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Etkileşim kaydı hatası:", error);
      res
        .status(500)
        .json({
          error: "Etkileşim kaydedilirken bir hata oluştu",
          details: error.message,
        });
    }
  },

  // Kullanıcının tüm etkileşimlerini getirme
  async getUserInteractions(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.query;

      let result;
      if (type) {
        // Belirli bir tür için etkileşimler
        if (!Object.values(INTERACTION_TYPES).includes(type)) {
          return res
            .status(400)
            .json({
              error: `Geçersiz etkileşim türü. Geçerli türler: ${Object.values(
                INTERACTION_TYPES
              ).join(", ")}`,
            });
        }
        result = await userTagInteractionModel.getUserInteractionsByType(
          userId,
          type
        );
      } else {
        // Tüm etkileşimler
        result = await userTagInteractionModel.getAllUserInteractions(userId);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Kullanıcı etkileşimleri getirme hatası:", error);
      res
        .status(500)
        .json({
          error: "Kullanıcı etkileşimleri getirilirken bir hata oluştu",
          details: error.message,
        });
    }
  },

  // Popüler etiketleri getirme
  async getPopularTags(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await userTagInteractionModel.getPopularTags(
        parseInt(limit)
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Popüler etiketleri getirme hatası:", error);
      res
        .status(500)
        .json({
          error: "Popüler etiketler getirilirken bir hata oluştu",
          details: error.message,
        });
    }
  },

  // Kullanıcının belirli bir etiket ile etkileşimlerini getirme
  async getUserTagInteractions(req, res) {
    try {
      const { userId, tag } = req.params;
      const result = await userTagInteractionModel.getUserTagInteractions(
        userId,
        tag
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Kullanıcı-etiket etkileşimleri getirme hatası:", error);
      res
        .status(500)
        .json({
          error: "Kullanıcı-etiket etkileşimleri getirilirken bir hata oluştu",
          details: error.message,
        });
    }
  },
};

module.exports = userTagInteractionController;
