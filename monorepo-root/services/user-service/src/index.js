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
const PORT = 3010;
console.log(`PORT: ${PORT}`);

// CORS ayarları
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

// CORS middleware'i uygula
app.use(cors(corsOptions));

// OPTIONS isteklerini doğrudan işleme
app.options('*', cors(corsOptions));

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Development ortamında geliştirmeyi kolaylaştırmak için
  crossOriginEmbedderPolicy: false
}));
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
    const server = app.listen(PORT, () => {
      console.log(`Kullanıcı servisi ${PORT} portunda çalışıyor`);
    });

    // Uncaught exception handling
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Don't terminate the server
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      // Don't terminate the server
    });

    // Handle client disconnections gracefully
    server.on('clientError', (error, socket) => {
      console.error('Client connection error:', error);
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      // Don't terminate the server
    });
  })
  .catch((err) => {
    console.error("Veritabanı senkronizasyon hatası:", err);
  });

module.exports = app;
