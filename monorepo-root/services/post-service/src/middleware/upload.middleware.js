const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  sanitizeFilename,
  cleanupOldFiles,
  isImageFile,
} = require("../utils/fileUtils");

// Upload klasörünün var olduğundan emin ol
const uploadDir = path.join(__dirname, "../../uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Uygulama başlatıldığında eski dosyaları temizle
cleanupOldFiles(uploadDir);

// Dosya depolama konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const cleanName = sanitizeFilename(nameWithoutExt);

    // Eğer temizlenen ad boşsa varsayılan ad kullan
    const finalName = cleanName || "image";

    cb(null, `${finalName}_${uniqueSuffix}${ext.toLowerCase()}`);
  },
});

// Dosya filtresi - sadece resim dosyalarına izin ver
const fileFilter = (req, file, cb) => {
  if (isImageFile(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Sadece resim dosyaları (JPEG, PNG, GIF, WebP) yüklenebilir"),
      false
    );
  }
};

// Multer konfigürasyonu
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Tek dosya
  },
});

// Tek resim yükleme middleware'i
exports.uploadSingle = upload.single("image");

// Hata yakalama middleware'i
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Tek seferde sadece bir dosya yükleyebilirsiniz.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Beklenmeyen dosya alanı. "image" alanını kullanın.',
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Dosya yükleme hatası",
    });
  }

  next();
};
