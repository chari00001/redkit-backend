const { Post } = require("../models");
const { Op } = require("sequelize");

// Yeni gönderi oluştur
exports.createPost = async (req, res) => {
  try {
    const { title, content, media_url, visibility, tags, allow_comments } =
      req.body;
    const post = await Post.create({
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
    const post = await Post.findOne({
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
    const result = await Post.destroy({
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

    const post = await Post.findOne({ where: whereClause });

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
      where.tags = { [Op.contains]: [tag] };
    }

    const { count, rows } = await Post.findAndCountAll({
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
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // TODO: Like tablosu oluşturulacak
    // Şimdilik sadece sayacı artırıyoruz
    await post.increment("likes_count");

    res.json({
      success: true,
      message: "Post beğenildi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post beğenilirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi paylaş
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // TODO: Share tablosu oluşturulacak
    // Şimdilik sadece sayacı artırıyoruz
    await post.increment("shares_count");

    res.json({
      success: true,
      message: "Post paylaşıldı",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post paylaşılırken bir hata oluştu",
      error: error.message,
    });
  }
};
