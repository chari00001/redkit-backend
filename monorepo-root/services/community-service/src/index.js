const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const sequelize = require("./db");

// Express uygulamasını oluştur
const app = express();

// Ortam değişkenlerini yükle
require("dotenv").config();

// Middleware'leri ayarla
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API rotalarını yükle
app.use("/api", routes);

// Ana rota
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Redit Community Service API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// Hata işleme ara yazılımı
app.use((err, req, res, next) => {
  console.error("Sunucu hatası:", err);
  res.status(500).json({
    message: "Sunucu hatası",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 işleyici
app.use((req, res) => {
  res.status(404).json({ message: "İstenen kaynak bulunamadı" });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3002;

// Veritabanı modelleri ve ilişkileri kur
const models = require("./models");

// Veritabanı ve sunucuyu başlat
(async () => {
  try {
    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    console.log("Veritabanı bağlantısı başarılı.");

    // Tabloları senkronize et (development için, production'da migration kullanılmalı)
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("Veritabanı tabloları senkronize edildi.");
    }

    // Sunucuyu dinlemeye başla
    app.listen(PORT, () => {
      console.log(`Community Service sunucusu ${PORT} portunda çalışıyor.`);
    });
  } catch (error) {
    console.error("Sunucu başlatılırken hata oluştu:", error);
  }
})();
