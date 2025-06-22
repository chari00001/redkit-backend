const express = require("express");
const cors = require("cors");
const userTagInteractionRoutes = require("./routes/userTagInteractionRoutes");

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware'leri ayarla
app.use(cors());
app.use(express.json());

// API rotalarını ayarla
app.use("/api", userTagInteractionRoutes);

// Sağlık kontrolü için endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "interaction-service" });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Etkileşim servisi ${PORT} portunda çalışıyor`);
});

// Hata yönetimi
process.on("unhandledRejection", (err) => {
  console.error("İşlenmeyen promise reddi:", err);
  // Hata durumunda sunucuyu nazikçe kapat
  process.exit(1);
});

module.exports = app;
