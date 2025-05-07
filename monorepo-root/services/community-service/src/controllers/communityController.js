const { Community, UserCommunity, User } = require("../models");
const { Op } = require("sequelize");

// Yeni topluluk oluşturma
exports.createCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      visibility,
      rules,
      tags,
      is_featured,
      cover_image_url,
    } = req.body;

    console.log("Community creation requested with data:", req.body);

    // User token'ından ID al
    const creatorId = req.user?.id;
    if (!creatorId) {
      return res
        .status(401)
        .json({ message: "Yetkilendirme hatası, lütfen tekrar giriş yapın" });
    }

    // Topluluk adının benzersiz olup olmadığını kontrol et
    const existingCommunity = await Community.findOne({ where: { name } });
    if (existingCommunity) {
      return res
        .status(400)
        .json({ message: "Bu isimde bir topluluk zaten var" });
    }

    // tags değerini düzgün bir şekilde dönüştür
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          console.error("Tags parsing error:", e);
          parsedTags = tags.split(',').map(tag => tag.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Yeni topluluk oluştur
    const community = await Community.create({
      creator_id: creatorId,
      name,
      description,
      visibility: visibility || "public",
      rules,
      tags: parsedTags,
      is_featured: is_featured || false,
      cover_image_url,
      member_count: 1, // Oluşturan kişi otomatik olarak üye olur
    });

    console.log("Community created:", community.id);

    // Topluluğu oluşturan kişiyi aynı zamanda yönetici olarak ekle
    await UserCommunity.create({
      user_id: creatorId,
      community_id: community.id,
      role: "admin",
    });

    res.status(201).json({
      message: "Topluluk başarıyla oluşturuldu",
      community,
    });
  } catch (error) {
    console.error("Topluluk oluşturma hatası:", error);
    res.status(500).json({
      message: "Topluluk oluşturulurken bir hata oluştu",
      error: error.message,
      detail: error.parent ? error.parent.detail : null,
    });
  }
};

// Tüm toplulukları getir
exports.getAllCommunities = async (req, res) => {
  try {
    const { name, visibility, sort, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Filtreleme koşulları
    const whereConditions = {};

    if (name) {
      whereConditions.name = { [Op.iLike]: `%${name}%` };
    }

    if (visibility) {
      whereConditions.visibility = visibility;
    }

    // Sadece görülebilir toplulukları getir (genel olarak public veya kullanıcı üye ise private)
    if (req.user) {
      // Özel topluluklar için kullanıcı üyeliğini kontrol et
      const userMemberships = await UserCommunity.findAll({
        where: { user_id: req.user.id },
        attributes: ["community_id"],
      });

      const userCommunityIds = userMemberships.map(
        (membership) => membership.community_id
      );

      whereConditions[Op.or] = [
        { visibility: "public" },
        { visibility: "restricted" },
        {
          [Op.and]: [
            { visibility: "private" },
            { id: { [Op.in]: userCommunityIds } },
          ],
        },
      ];
    } else {
      // Kimliği doğrulanmamış kullanıcılar için sadece herkese açık toplulukları göster
      whereConditions.visibility = "public";
    }

    // Sıralama seçenekleri
    let order = [["created_at", "DESC"]];
    if (sort === "oldest") {
      order = [["created_at", "ASC"]];
    } else if (sort === "members") {
      order = [["member_count", "DESC"]];
    } else if (sort === "posts") {
      order = [["post_count", "DESC"]];
    }

    const { count, rows: communities } = await Community.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "profile_picture_url"],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      communities,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Toplulukları getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Topluluklar getirilirken bir hata oluştu" });
  }
};

// Topluluk detaylarını getir
exports.getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "profile_picture_url"],
        },
      ],
    });

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Özel topluluklar için erişim kontrolü
    if (community.visibility === "private") {
      // Kullanıcı giriş yapmış mı kontrol et
      if (!req.user) {
        return res.status(403).json({
          message: "Bu özel topluluğa erişim için giriş yapmalısınız",
        });
      }

      // Kullanıcı bu özel topluluğun üyesi mi kontrol et
      const isMember = await UserCommunity.findOne({
        where: {
          user_id: req.user.id,
          community_id: id,
        },
      });

      if (!isMember) {
        return res
          .status(403)
          .json({ message: "Bu özel topluluğa erişim izniniz yok" });
      }
    }

    res.status(200).json(community);
  } catch (error) {
    console.error("Topluluk detayı getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Topluluk detayları getirilirken bir hata oluştu" });
  }
};

// Topluluğu güncelle
exports.updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      visibility,
      rules,
      tags,
      is_featured,
      cover_image_url,
    } = req.body;

    // Kullanıcı kimliğini doğrula
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Yetkilendirme hatası, lütfen tekrar giriş yapın" });
    }

    // Topluluğun var olup olmadığını kontrol et
    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Kullanıcının toplulukta admin veya moderatör olup olmadığını kontrol et
    const userMembership = await UserCommunity.findOne({
      where: {
        user_id: userId,
        community_id: id,
        role: {
          [Op.in]: ["admin", "moderator"],
        },
      },
    });

    if (!userMembership && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bu topluluğu güncelleme yetkiniz yok",
      });
    }

    // Topluluğu güncelle
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (rules !== undefined) updateData.rules = rules;
    if (is_featured !== undefined && req.user.role === "admin")
      updateData.is_featured = is_featured;
    if (cover_image_url !== undefined)
      updateData.cover_image_url = cover_image_url;
    if (tags !== undefined) {
      updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    await community.update(updateData);

    res.status(200).json({
      message: "Topluluk başarıyla güncellendi",
      community,
    });
  } catch (error) {
    console.error("Topluluk güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Topluluk güncellenirken bir hata oluştu" });
  }
};

// Topluluğa katıl
exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Kullanıcı zaten üye mi kontrol et
    const existingMembership = await UserCommunity.findOne({
      where: {
        user_id,
        community_id: id,
      },
    });

    if (existingMembership) {
      return res
        .status(400)
        .json({ message: "Zaten bu topluluğun üyesisiniz" });
    }

    // Özel topluluk kontrolü
    if (community.visibility === "private") {
      return res
        .status(403)
        .json({ message: "Bu özel topluluğa katılmak için davet gereklidir" });
    }

    // Topluluğa katıl
    await UserCommunity.create({
      user_id,
      community_id: id,
      role: "member",
    });

    // Üye sayısını güncelle
    await community.increment("member_count");

    res.status(200).json({ message: "Topluluğa başarıyla katıldınız" });
  } catch (error) {
    console.error("Topluluğa katılma hatası:", error);
    res.status(500).json({ message: "Topluluğa katılırken bir hata oluştu" });
  }
};

// Topluluktan ayrıl
exports.leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Kullanıcı üye mi kontrol et
    const membership = await UserCommunity.findOne({
      where: {
        user_id,
        community_id: id,
      },
    });

    if (!membership) {
      return res
        .status(400)
        .json({ message: "Bu topluluğun üyesi değilsiniz" });
    }

    // Topluluk yaratıcısı ayrılamaz
    if (community.creator_id === user_id) {
      return res.status(400).json({
        message:
          "Topluluğun yaratıcısı olarak ayrılamazsınız. Topluluğu silmeyi deneyin veya yönetici rolünü devredin.",
      });
    }

    // Üyeliği kaldır
    await membership.destroy();

    // Üye sayısını güncelle
    await community.decrement("member_count");

    res.status(200).json({ message: "Topluluktan başarıyla ayrıldınız" });
  } catch (error) {
    console.error("Topluluktan ayrılma hatası:", error);
    res.status(500).json({ message: "Topluluktan ayrılırken bir hata oluştu" });
  }
};

// Topluluğu sil
exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Silme yetkisi kontrolü
    if (community.creator_id !== user_id) {
      const userRole = await UserCommunity.findOne({
        where: {
          user_id,
          community_id: id,
          role: "admin",
        },
      });

      if (!userRole) {
        return res
          .status(403)
          .json({ message: "Topluluğu silmek için yetkiniz yok" });
      }
    }

    // Önce tüm üyelikleri sil
    await UserCommunity.destroy({
      where: { community_id: id },
    });

    // Topluluğu sil
    await community.destroy();

    res.status(200).json({ message: "Topluluk başarıyla silindi" });
  } catch (error) {
    console.error("Topluluk silme hatası:", error);
    res.status(500).json({ message: "Topluluk silinirken bir hata oluştu" });
  }
};

// Topluluk üyelerini getir
exports.getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, search, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Özel topluluklar için erişim kontrolü
    if (community.visibility === "private") {
      // Kullanıcı giriş yapmış mı kontrol et
      if (!req.user) {
        return res.status(403).json({
          message:
            "Bu özel topluluğun üye listesine erişim için giriş yapmalısınız",
        });
      }

      // Kullanıcı bu özel topluluğun üyesi mi kontrol et
      const isMember = await UserCommunity.findOne({
        where: {
          user_id: req.user.id,
          community_id: id,
        },
      });

      if (!isMember) {
        return res.status(403).json({
          message: "Bu özel topluluğun üye listesine erişim izniniz yok",
        });
      }
    }

    // Üye filtreleme koşulları
    const memberWhere = { community_id: id };
    if (role) {
      memberWhere.role = role;
    }

    // Kullanıcı arama koşulları
    const userWhere = {};
    if (search) {
      userWhere.username = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: members } = await UserCommunity.findAndCountAll({
      where: memberWhere,
      include: [
        {
          model: User,
          attributes: ["id", "username", "profile_picture_url"],
          where: userWhere,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["role", "ASC"], // önce yöneticiler
        ["joined_at", "ASC"], // sonra katılma tarihine göre
      ],
    });

    res.status(200).json({
      members,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Topluluk üyelerini getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Topluluk üyeleri getirilirken bir hata oluştu" });
  }
};

// Üye rolünü güncelleme
exports.updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    if (!["member", "moderator", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Geçersiz rol. Rol member, moderator veya admin olmalıdır.",
      });
    }

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }

    // Yetki kontrolü
    const adminMembership = await UserCommunity.findOne({
      where: {
        user_id: adminId,
        community_id: id,
      },
    });

    // Sadece topluluk yaratıcısı veya admin yetkilendirme yapabilir
    if (
      community.creator_id !== adminId &&
      (!adminMembership || adminMembership.role !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Üye rolünü değiştirmek için yetkiniz yok" });
    }

    // Hedef üyeliği bul
    const targetMembership = await UserCommunity.findOne({
      where: {
        user_id: userId,
        community_id: id,
      },
    });

    if (!targetMembership) {
      return res
        .status(404)
        .json({ message: "Kullanıcı bu topluluğun üyesi değil" });
    }

    // Topluluk yaratıcısının rolü değiştirilemez
    if (parseInt(userId) === community.creator_id) {
      return res
        .status(400)
        .json({ message: "Topluluk yaratıcısının rolü değiştirilemez" });
    }

    // Rolü güncelle
    await targetMembership.update({ role });

    res.status(200).json({
      message: "Üye rolü başarıyla güncellendi",
      membership: targetMembership,
    });
  } catch (error) {
    console.error("Üye rolü güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Üye rolü güncellenirken bir hata oluştu" });
  }
};

// Kullanıcının üye olduğu toplulukları getir
exports.getUserCommunities = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: memberships } = await UserCommunity.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Community,
          attributes: [
            "id",
            "name",
            "description",
            "visibility",
            "member_count",
            "post_count",
            "cover_image_url",
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      communities: memberships.map((m) => m.Community),
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Kullanıcı topluluklarını getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Kullanıcı toplulukları getirilirken bir hata oluştu" });
  }
};
