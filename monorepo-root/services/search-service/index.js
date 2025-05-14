const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Route'ları import et
const searchRoutes = require("./routes/search");

// Express uygulamasını başlat
const app = express();

// Middleware'leri ayarla
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Route'ları ayarla
app.use("/api/search", searchRoutes);

// Ana root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Arama servisi çalışıyor" });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Sunucu hatası",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 yakalama middleware'i
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint bulunamadı" });
});

// Sunucuyu dinle
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Arama servisi ${PORT} portunda çalışıyor`);
});

module.exports = app;
