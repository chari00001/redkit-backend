const db = require("../models");
const sequelize = require("../db");
const { Op } = require("sequelize");

// Yeni yorum oluşturma
exports.createComment = async (req, res) => {
  try {
    const { content, parent_id, anonymous } = req.body;
    const post_id = req.params.postId;
    const user_id = req.user.id;

    // İlgili gönderiyi kontrol et
    const post = await db.Post.findByPk(post_id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Gönderi bulunamadı",
      });
    }

    // Gönderi yorumlara kapalı mı kontrol et
    if (!post.allow_comments) {
      return res.status(403).json({
        success: false,
        message: "Bu gönderiye yorum yapılamaz",
      });
    }

    // Eğer parent_id varsa, ana yorumun varlığını kontrol et
    if (parent_id) {
      const parentComment = await db.Comment.findOne({
        where: { id: parent_id, post_id },
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Yanıt verilen yorum bulunamadı",
        });
      }
    }

    // Transaction başlat
    const t = await sequelize.transaction();

    try {
      // Yorumu oluştur
      const comment = await db.Comment.create(
        {
          post_id,
          user_id,
          content,
          parent_id: parent_id || null,
          anonymous: anonymous || false,
        },
        { transaction: t }
      );

      // Eğer bir ana yoruma yanıt ise, ana yorumun yanıt sayısını artır
      if (parent_id) {
        await db.Comment.increment("replies_count", {
          where: { id: parent_id },
          transaction: t,
        });
      }

      // Gönderinin yorum sayısını artır
      await db.Post.increment("comments_count", {
        where: { id: post_id },
        transaction: t,
      });

      // Transaction'ı tamamla
      await t.commit();

      res.status(201).json({
        success: true,
        message: "Yorum başarıyla oluşturuldu",
        data: comment,
      });
    } catch (error) {
      // Hata durumunda transaction'ı geri al
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Yorum oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorum oluşturulurken bir hata oluştu",
      error: error.message,
    });
  }
};

// Yorumu güncelleme
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;
    const user_id = req.user.id;

    const comment = await db.Comment.findOne({
      where: {
        id: commentId,
        user_id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı veya bu işlem için yetkiniz yok",
      });
    }

    // Yorumu güncelle
    comment.content = content;
    await comment.save();

    res.json({
      success: true,
      message: "Yorum başarıyla güncellendi",
      data: comment,
    });
  } catch (error) {
    console.error("Yorum güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorum güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Yorumu silme
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.id;

    const comment = await db.Comment.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı",
      });
    }

    // Kullanıcı kendi yorumunu veya admin/moderatör yetkisine sahipse silebilir
    if (
      comment.user_id !== user_id &&
      req.user.role !== "admin" &&
      req.user.role !== "moderator"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    // Transaction başlat
    const t = await sequelize.transaction();

    try {
      // Eğer bir ana yoruma yanıt ise, ana yorumun yanıt sayısını azalt
      if (comment.parent_id) {
        await db.Comment.decrement("replies_count", {
          where: { id: comment.parent_id },
          transaction: t,
        });
      }

      // Gönderinin yorum sayısını azalt
      await db.Post.decrement("comments_count", {
        where: { id: comment.post_id },
        transaction: t,
      });

      // Yorumu sil
      await comment.destroy({ transaction: t });

      // Transaction'ı tamamla
      await t.commit();

      res.json({
        success: true,
        message: "Yorum başarıyla silindi",
      });
    } catch (error) {
      // Hata durumunda transaction'ı geri al
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorum silinirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Post için yorumları getirme
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10, parent_id = null } = req.query;

    const offset = (page - 1) * limit;

    // İlgili gönderiyi kontrol et
    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Gönderi bulunamadı",
      });
    }

    // Yorumları getir (sadece ana yorumlar veya belirli bir yorumun yanıtları)
    const where = {
      post_id: postId,
    };

    const { count, rows } = await db.Comment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        comments: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorumlar getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Yorum beğenme/beğenmekten vazgeçme
exports.toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    // Yorum var mı kontrol et
    const comment = await db.Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı",
      });
    }

    // Transaction başlat
    const t = await sequelize.transaction();

    try {
      // Mevcut beğeni var mı kontrol et
      const existingLike = await sequelize.query(
        "SELECT * FROM comment_likes WHERE user_id = :userId AND comment_id = :commentId",
        {
          replacements: { userId, commentId },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      let message = "";

      if (existingLike && existingLike.length > 0) {
        // Beğeni varsa, beğeniyi kaldır
        await sequelize.query(
          "DELETE FROM comment_likes WHERE user_id = :userId AND comment_id = :commentId",
          {
            replacements: { userId, commentId },
            type: sequelize.QueryTypes.DELETE,
            transaction: t,
          }
        );

        // Yorum beğeni sayısını azalt
        await comment.decrement("likes_count", { transaction: t });
        message = "Yorum beğenisi kaldırıldı";
      } else {
        // Beğeni yoksa, beğeni ekle (comment_likes tablosu olmalı)
        await sequelize.query(
          "INSERT INTO comment_likes (user_id, comment_id, liked_at) VALUES (:userId, :commentId, NOW())",
          {
            replacements: { userId, commentId },
            type: sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );

        // Yorum beğeni sayısını artır
        await comment.increment("likes_count", { transaction: t });
        message = "Yorum beğenildi";
      }

      // Transaction'ı tamamla
      await t.commit();

      res.json({
        success: true,
        message,
      });
    } catch (error) {
      // Hata durumunda transaction'ı geri al
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Yorum beğeni işlemi hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorum beğeni işlemi sırasında bir hata oluştu",
      error: error.message,
    });
  }
};
