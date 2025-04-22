const { Post } = require("../models");
const { Op } = require("sequelize");

// Yeni gönderi oluştur
exports.createPost = async (req, res) => {
  try {
    const { title, content, media_url, visibility, tags, allow_comments } =
      req.body;

    // Test için user_id'yi manuel olarak ayarla
    const user_id = req.user ? req.user.id : 3;

    const post = await Post.create({
      user_id,
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
    console.error("Post oluşturma hatası:", error);
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
    const { id } = req.params;
    const { title, content, media_url, visibility, tags, allow_comments } =
      req.body;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    await post.update({
      title,
      content,
      media_url,
      visibility,
      tags,
      allow_comments,
    });

    res.json({
      success: true,
      message: "Post başarıyla güncellendi",
      data: post,
    });
  } catch (error) {
    console.error("Post güncelleme hatası:", error);
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
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: "Post başarıyla silindi",
    });
  } catch (error) {
    console.error("Post silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Post silinirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Tek bir gönderiyi getir
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

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

// Tüm gönderileri listele
exports.listPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, visibility } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    if (visibility) {
      where.visibility = visibility;
    }

    const posts = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        total: posts.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(posts.count / limit),
      },
    });
  } catch (error) {
    console.error("Post listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Postlar listelenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gönderiyi beğen
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // Beğeni sayısını artır
    await post.increment("likes_count");

    res.json({
      success: true,
      message: "Post başarıyla beğenildi",
      likes: post.likes_count + 1,
    });
  } catch (error) {
    console.error("Post beğenme hatası:", error);
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
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // Paylaşım sayısını artır
    await post.increment("shares_count");

    res.json({
      success: true,
      message: "Post başarıyla paylaşıldı",
      shares: post.shares_count + 1,
    });
  } catch (error) {
    console.error("Post paylaşma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Post paylaşılırken bir hata oluştu",
      error: error.message,
    });
  }
};
