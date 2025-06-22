const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const sequelize = require("./db");
const { User } = require("./models");

// Kullanıcı rotalarını içe aktarma
const userRoutes = require("./routes/user.routes");

// Uygulama yapılandırması
const app = express();
const PORT = 3001;
console.log(`PORT: ${PORT}`);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ana rota
app.get("/", (req, res) => {
  res.json({ message: "Kullanıcı Servisi API" });
});

// Kullanıcı rotalarını kullanma
app.use("/api/users", userRoutes);

// 404 hata işleyici
app.use((req, res, next) => {
  res.status(404).json({ message: "İstenen kaynak bulunamadı" });
});

// Genel hata işleyici
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Sunucu hatası oluştu",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// Veritabanını senkronize et ve sunucuyu başlat
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Veritabanı senkronize edildi");
    app.listen(PORT, () => {
      console.log(`Kullanıcı servisi ${PORT} portunda çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("Veritabanı senkronizasyon hatası:", err);
  });

module.exports = app;
