const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TEST_MODE = process.env.TEST_MODE === 'true';

// Kimlik doğrulama ara yazılımı
exports.authenticate = (req, res, next) => {
  try {
    // Test modu aktifse, doğrudan test kullanıcısı oluştur
    if (TEST_MODE) {
      console.log("TEST MODE: Bypassing token validation");
      req.user = { id: 4, email: "test@test.com", role: "admin" };
      return next();
    }

    // Token'ı al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Kimlik doğrulama hatası: Geçersiz token formatı" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Kimlik doğrulama hatası: Token bulunamadı" });
    }

    // Token'ı doğrula
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Geçerli bir user ID kontrolü
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          message:
            "Kimlik doğrulama hatası: Token geçersiz veya eksik kullanıcı bilgisi içeriyor",
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message:
            "Kimlik doğrulama hatası: Token süresi dolmuş, lütfen tekrar giriş yapın",
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Kimlik doğrulama hatası: Geçersiz token",
        });
      } else {
        return res.status(401).json({
          message: "Kimlik doğrulama hatası: " + jwtError.message,
        });
      }
    }
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    return res
      .status(401)
      .json({ message: "Kimlik doğrulama hatası: Sistem hatası" });
  }
};

// İsteğe bağlı kimlik doğrulama
exports.optionalAuthenticate = (req, res, next) => {
  // Test modu aktifse, doğrudan test kullanıcısı oluştur
  if (TEST_MODE) {
    req.user = { id: 4, email: "test@test.com", role: "admin" };
    return next();
  }

  try {
    // Token'ı al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Token yoksa devam et
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    // Token'ı doğrula
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        req.user = decoded;
      }
    } catch (jwtError) {
      // jwt.verify hatası olduğunda sessizce devam et
      console.error("İsteğe bağlı token doğrulama hatası:", jwtError.message);
    }
    next();
  } catch (error) {
    // Genel hata durumunda da devam et
    console.error("İsteğe bağlı token işleminde hata:", error);
    next();
  }
};

// Admin kontrolü
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Bu işlem için admin yetkisi gerekiyor" });
};

// Moderatör kontrolü
exports.isModerator = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "moderator")
  ) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Bu işlem için moderatör yetkisi gerekiyor" });
};
