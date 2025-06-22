const fs = require("fs");
const path = require("path");

/**
 * Dosya adını URL-safe hale getirir
 * @param {string} filename - Temizlenecek dosya adı
 * @returns {string} - Temizlenmiş dosya adı
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Özel karakterleri underscore ile değiştir
    .replace(/_{2,}/g, "_") // Birden fazla underscore'u tek yapıştır
    .replace(/^_+|_+$/g, "") // Başta ve sonda underscore varsa kaldır
    .toLowerCase(); // Küçük harfe çevir
};

/**
 * Eski upload dosyalarını temizler (7 gün ve daha eski)
 * @param {string} uploadDir - Upload klasörü yolu
 */
const cleanupOldFiles = (uploadDir) => {
  try {
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 gün

    if (!fs.existsSync(uploadDir)) {
      return;
    }

    const files = fs.readdirSync(uploadDir);

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > sevenDaysInMs) {
        fs.unlinkSync(filePath);
        console.log(`Eski dosya silindi: ${file}`);
      }
    });
  } catch (error) {
    console.error("Dosya temizleme hatası:", error);
  }
};

/**
 * Dosya boyutunu human-readable formata çevirir
 * @param {number} bytes - Byte cinsinden dosya boyutu
 * @returns {string} - Formatlanmış boyut
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Dosya türünü kontrol eder
 * @param {string} mimetype - Dosyanın MIME tipi
 * @returns {boolean} - Resim dosyası ise true
 */
const isImageFile = (mimetype) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  return allowedTypes.includes(mimetype);
};

module.exports = {
  sanitizeFilename,
  cleanupOldFiles,
  formatFileSize,
  isImageFile,
};
