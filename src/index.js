const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./db");
require("dotenv").config();

const app = express();

// Temel middleware'ler
app.use(cors());
app.use(bodyParser.json());

// Routes
const postRoutes = require("./routes/post.routes");
app.use("/api/posts", postRoutes);

// Ana rota
app.get("/", (req, res) => {
  res.json({
    message: "Redit Post Service API'sine Hoş Geldiniz",
    version: "1.0.0",
  });
});

const PORT = process.env.PORT || 3002;

// Veritabanı bağlantısı ve sunucuyu başlatma
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
