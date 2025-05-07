const jwt = require("jsonwebtoken");
const { User } = require("../models");

// JWT için gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Kimlik doğrulama middleware'i
 * API rotalarını yetkilendirmek için kullanılır
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header'ını kontrol et
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Yetkilendirme token'ı bulunamadı" });
    }

    // Token'ı ayıkla
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Yetkilendirme token'ı bulunamadı" });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, JWT_SECRET);

      // Kullanıcıyı veritabanından bul
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
      }

      // Kullanıcı hesabının aktif olduğunu kontrol et
      if (user.account_status !== "active") {
        return res.status(403).json({
          message: "Hesabınız askıya alınmış veya devre dışı bırakılmış",
        });
      }

      // Kullanıcı nesnesini request'e ekle
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token süresi dolmuş, lütfen tekrar giriş yapın" });
      }

      return res.status(401).json({ message: "Geçersiz token" });
    }
  } catch (error) {
    console.error("Kimlik doğrulama hatası:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" });
  }
};

/**
 * Rol tabanlı yetkilendirme middleware'i
 * Belirli rollere sahip kullanıcılara erişim izni vermek için kullanılır
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Kimlik doğrulama gerekli" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bu işlem için yetkiniz yok",
      });
    }

    next();
  };
};

module.exports = authMiddleware;
module.exports.authorizeRoles = authorizeRoles;
