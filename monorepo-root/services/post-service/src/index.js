const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const postRoutes = require("./routes/post.routes");
const sequelize = require("./db");

const app = express();

// Middleware'leri yapılandır
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static dosya servisi - yüklenen resimler için
app.use("/static/uploads", express.static(path.join(__dirname, "../uploads")));

// Ana rota
app.get("/", (req, res) => {
  res.json({
    message: "Redit Post Service API'sine Hoş Geldiniz",
    version: "1.0.0",
  });
});

// Post rotalarını ekle
app.use("/api/posts", postRoutes);

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Sunucu hatası",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 yakalama
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "İstenen kaynak bulunamadı",
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3002;

// Veritabanı senkronizasyonu ve sunucu başlatma
sequelize
  .sync()
  .then(() => {
    console.log("Veritabanı tabloları senkronize edildi");
    app.listen(PORT, () => {
      console.log(`Post servisi ${PORT} portunda çalışıyor`);
      console.log(`http://localhost:${PORT} adresinden erişebilirsiniz`);
    });
  })
  .catch((error) => {
    console.error("Veritabanı senkronizasyonu başarısız:", error);
    process.exit(1);
  });
