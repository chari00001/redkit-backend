const { User, Follow } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// JWT için gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Kullanıcı kaydı
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, date_of_birth, location, bio } =
      req.body;

    // E-posta veya kullanıcı adının daha önce alınıp alınmadığını kontrol et
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Bu e-posta veya kullanıcı adı zaten kullanılıyor",
      });
    }

    // Parolayı hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      date_of_birth,
      location,
      bio,
      role: "user",
      is_verified: false,
      account_status: "active",
      subscription_level: "free",
    });

    // JWT token oluştur
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const verifyToken = jwt.sign(
      { id: newUser.id, action: "verify_account" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      token,
      verifyToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcı girişi
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // Parolayı doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // Hesabın aktif olduğunu kontrol et
    if (user.account_status !== "active") {
      return res.status(403).json({
        message: "Hesabınız askıya alınmış veya devre dışı bırakılmış",
      });
    }

    // Son giriş zamanını güncelle
    await user.update({ last_login: new Date() });

    // JWT token oluştur
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url,
        account_status: user.account_status,
        subscription_level: user.subscription_level,
      },
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Profil bilgilerini getir
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profil getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Profil bilgilerini güncelle
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, location, profile_picture_url, date_of_birth } =
      req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı adı değiştiyse benzersiz olduğunu kontrol et
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res
          .status(400)
          .json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }
    }

    // Profili güncelle
    await user.update({
      username: username || user.username,
      bio: bio || user.bio,
      location: location || user.location,
      profile_picture_url: profile_picture_url || user.profile_picture_url,
      date_of_birth: date_of_birth || user.date_of_birth,
    });

    res.json({
      message: "Profil başarıyla güncellendi",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        profile_picture_url: user.profile_picture_url,
        date_of_birth: user.date_of_birth,
      },
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Şifre değiştirme
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Mevcut şifreyi doğrula
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mevcut şifre yanlış" });
    }

    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
    await user.update({ password: hashedPassword });

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * E-posta değiştirme
 */
exports.changeEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Şifre yanlış" });
    }

    // E-postanın benzersiz olduğunu kontrol et
    const existingEmail = await User.findOne({ where: { email: newEmail } });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kullanılıyor" });
    }

    // E-postayı güncelle
    await user.update({ email: newEmail, is_verified: false });

    res.json({
      message:
        "E-posta başarıyla değiştirildi, lütfen yeni e-postanızı doğrulayın",
    });
  } catch (error) {
    console.error("E-posta değiştirme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Şifremi unuttum
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // E-posta adresini kontrol et
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Bu e-posta adresiyle ilişkili hesap bulunamadı" });
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = jwt.sign(
      { id: user.id, action: "reset_password" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Burada e-posta gönderme işlemi yapılacak (örneğin: nodemailer kullanarak)
    // Şu anda yalnızca simüle edilmiştir

    res.json({
      message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi",
      resetToken, // Gerçek uygulamada token kullanıcıya gönderilmez
    });
  } catch (error) {
    console.error("Şifremi unuttum işlemi hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Şifre sıfırlama
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Geçersiz veya süresi dolmuş token" });
    }

    if (decoded.action !== "reset_password") {
      return res.status(401).json({ message: "Geçersiz token türü" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
    await user.update({ password: hashedPassword });

    res.json({
      message: "Şifreniz başarıyla sıfırlandı, şimdi giriş yapabilirsiniz",
    });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Hesap doğrulama
 */
exports.verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Geçersiz veya süresi dolmuş token" });
    }

    if (decoded.action !== "verify_account") {
      return res.status(401).json({ message: "Geçersiz token türü" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Hesabı doğrula
    await user.update({ is_verified: true });

    res.json({ message: "Hesabınız başarıyla doğrulandı" });
  } catch (error) {
    console.error("Hesap doğrulama hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Bildirim tercihlerini güncelleme
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const { notification_preferences } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Bildirim tercihlerini güncelle
    await user.update({ notification_preferences });

    res.json({
      message: "Bildirim tercihleri başarıyla güncellendi",
      notification_preferences,
    });
  } catch (error) {
    console.error("Bildirim tercihleri güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Tüm kullanıcıları getir (admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Sadece admin yetkisi kontrolü
    console.log(req.user);

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      users: users || [],
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error("Kullanıcıları getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcıyı ID ile getir
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcıyı güncelle (admin)
 */
exports.updateUser = async (req, res) => {
  try {
    // Sadece admin yetkisi kontrolü
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    const { id } = req.params;
    const { username, email, role, account_status, subscription_level } =
      req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı adı değiştiyse benzersiz olduğunu kontrol et
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res
          .status(400)
          .json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }
    }

    // E-posta değiştiyse benzersiz olduğunu kontrol et
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "Bu e-posta adresi zaten kullanılıyor" });
      }
    }

    // Kullanıcıyı güncelle
    await user.update({
      username: username || user.username,
      email: email || user.email,
      role: role || user.role,
      account_status: account_status || user.account_status,
      subscription_level: subscription_level || user.subscription_level,
    });

    res.json({
      message: "Kullanıcı başarıyla güncellendi",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        account_status: user.account_status,
        subscription_level: user.subscription_level,
      },
    });
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcıyı sil (admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    // Sadece admin yetkisi kontrolü
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcıyı sil
    await user.destroy();

    res.json({ message: "Kullanıcı başarıyla silindi" });
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcı durumunu güncelle (admin)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    // Sadece admin yetkisi kontrolü
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    const { id } = req.params;
    const { account_status } = req.body;

    if (!["active", "suspended", "deactivated"].includes(account_status)) {
      return res.status(400).json({ message: "Geçersiz hesap durumu" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı durumunu güncelle
    await user.update({ account_status });

    res.json({
      message: `Kullanıcı durumu başarıyla "${account_status}" olarak güncellendi`,
      user: {
        id: user.id,
        username: user.username,
        account_status: user.account_status,
      },
    });
  } catch (error) {
    console.error("Kullanıcı durumu güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcıyı takip et
 */
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = req.params.id;

    // Kendini takip etmeyi önle
    if (followerId === followeeId) {
      return res.status(400).json({ message: "Kendinizi takip edemezsiniz" });
    }

    // Takip edilecek kullanıcıyı kontrol et
    const followee = await User.findByPk(followeeId);
    if (!followee) {
      return res
        .status(404)
        .json({ message: "Takip edilecek kullanıcı bulunamadı" });
    }

    // Takip ilişkisini oluştur
    const [follow, created] = await Follow.findOrCreate({
      where: { follower_id: followerId, followee_id: followeeId },
      defaults: { followed_at: new Date() },
    });

    if (!created) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcıyı zaten takip ediyorsunuz" });
    }

    res.status(201).json({ message: "Kullanıcı başarıyla takip edildi" });
  } catch (error) {
    console.error("Kullanıcı takip etme hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Kullanıcı takibini bırak
 */
exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = req.params.id;

    // Takip ilişkisini kontrol et
    const follow = await Follow.findOne({
      where: { follower_id: followerId, followee_id: followeeId },
    });

    if (!follow) {
      return res
        .status(404)
        .json({ message: "Bu kullanıcıyı takip etmiyorsunuz" });
    }

    // Takip ilişkisini sil
    await follow.destroy();

    res.json({ message: "Kullanıcı takibi başarıyla bırakıldı" });
  } catch (error) {
    console.error("Kullanıcı takibini bırakma hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Takipçileri getir
 */
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const followers = await User.findAll({
      attributes: ["id", "username", "profile_picture_url", "bio"],
      include: [
        {
          model: User,
          as: "following",
          attributes: [],
          through: {
            attributes: [],
            where: { followee_id: userId },
          },
        },
      ],
      limit,
      offset,
      subQuery: false,
    });

    const totalFollowers = await Follow.count({
      where: { followee_id: userId },
    });

    res.json({
      followers: followers || [],
      pagination: {
        total: totalFollowers,
        page,
        limit,
        totalPages: Math.ceil(totalFollowers / limit),
      },
    });
  } catch (error) {
    console.error("Takipçileri getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

/**
 * Takip edilenleri getir
 */
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const following = await User.findAll({
      attributes: ["id", "username", "profile_picture_url", "bio"],
      include: [
        {
          model: User,
          as: "followers",
          attributes: [],
          through: {
            attributes: [],
            where: { follower_id: userId },
          },
        },
      ],
      limit,
      offset,
      subQuery: false,
    });

    const totalFollowing = await Follow.count({
      where: { follower_id: userId },
    });

    res.json({
      following: following || [],
      pagination: {
        total: totalFollowing,
        page,
        limit,
        totalPages: Math.ceil(totalFollowing / limit),
      },
    });
  } catch (error) {
    console.error("Takip edilenleri getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
