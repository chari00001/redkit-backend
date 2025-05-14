const { Sequelize } = require("sequelize");
require("dotenv").config();

// Veritabanı bağlantı bilgileri
const DB_NAME = process.env.DB_NAME || "social_platform";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_DIALECT = "postgres";

// Sequelize bağlantısı
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Bağlantıyı test et
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Veritabanı bağlantısı başarıyla kuruldu.");
  } catch (error) {
    console.error("Veritabanına bağlanılamadı:", error);
  }
})();

module.exports = sequelize;
