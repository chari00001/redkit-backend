const db = require("../models");
const sequelize = require("../db");
const { Op } = require("sequelize");

// Yeni gönderi oluştur
exports.createPost = async (req, res) => {
  try {
    const { title, content, media_url, visibility, tags, allow_comments } =
      req.body;

    console.log(tags);

    const post = await db.Post.create({
      user_id: req.user.id,
      title,
      content,
      media_url,
      visibility,
      tags,
      allow_comments,
    });

    res.status(201).json({
      success: true,
      message: "Post başarıyla oluşturuldu",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Post oluşturulurken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi güncelle
exports.updatePost = async (req, res) => {
  try {
    const post = await db.Post.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı veya bu işlem için yetkiniz yok",
      });
    }

    const updatedPost = await post.update(req.body);

    res.json({
      success: true,
      message: "Post başarıyla güncellendi",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi sil
exports.deletePost = async (req, res) => {
  try {
    const result = await db.Post.destroy({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı veya bu işlem için yetkiniz yok",
      });
    }

    res.json({
      success: true,
      message: "Post başarıyla silindi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post silinirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi getir
exports.getPost = async (req, res) => {
  try {
    let whereClause = {
      id: req.params.id,
      visibility: "public",
    };

    if (req.user) {
      whereClause = {
        id: req.params.id,
        [Op.or]: [
          { visibility: "public" },
          {
            [Op.and]: [{ visibility: "private" }, { user_id: req.user.id }],
          },
        ],
      };
    }

    const post = await db.Post.findOne({ where: whereClause });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // Görüntülenme sayısını artır
    await post.increment("views_count");

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Post getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Post getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderileri listele
exports.listPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      visibility = "public",
      userId,
      tag,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Görünürlük filtresi
    if (visibility === "public") {
      where.visibility = "public";
    } else if (visibility === "private" && req.user) {
      where.user_id = req.user.id;
      where.visibility = "private";
    }

    // Kullanıcı filtresi
    if (userId) {
      where.user_id = userId;
    }

    // Etiket filtresi
    if (tag) {
      where.tags = { [db.Op.contains]: [tag] };
    }

    const { count, rows } = await db.Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        posts: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Postlar listelenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi beğen/beğenmekten vazgeç
exports.toggleLike = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // Transaction başlat
    const t = await sequelize.transaction();

    try {
      // Post var mı kontrol et
      const post = await db.Post.findByPk(postId, { transaction: t });

      if (!post) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Post bulunamadı",
        });
      }

      // Mevcut beğeni var mı kontrol et
      const existingLike = await sequelize.query(
        "SELECT * FROM likes WHERE user_id = :userId AND post_id = :postId",
        {
          replacements: { userId, postId },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      let message = "";

      if (existingLike && existingLike.length > 0) {
        // Beğeni varsa, beğeniyi kaldır
        await sequelize.query(
          "DELETE FROM likes WHERE user_id = :userId AND post_id = :postId",
          {
            replacements: { userId, postId },
            type: sequelize.QueryTypes.DELETE,
            transaction: t,
          }
        );

        // Post beğeni sayısını azalt
        await post.decrement("likes_count", { transaction: t });
        message = "Post beğenisi kaldırıldı";
      } else {
        // Beğeni yoksa, beğeni ekle
        await sequelize.query(
          "INSERT INTO likes (user_id, post_id, liked_at) VALUES (:userId, :postId, NOW())",
          {
            replacements: { userId, postId },
            type: sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );

        // Post beğeni sayısını artır
        await post.increment("likes_count", { transaction: t });
        message = "Post beğenildi";
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
    console.error("Beğeni işlemi hatası:", error);
    res.status(500).json({
      success: false,
      message: "Beğeni işlemi sırasında bir hata oluştu",
      error: error.message,
    });
  }
};

// Post paylaşma
exports.sharePost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Post var mı kontrol et
    const post = await db.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // Paylaşım sayısını artır
    await post.increment("shares_count");

    // Gerçek bir paylaşım mekanizması burada eklenebilir

    res.json({
      success: true,
      message: "Post başarıyla paylaşıldı",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post paylaşılırken bir hata oluştu",
      error: error.message,
    });
  }
};
