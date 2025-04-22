const { Sequelize } = require("sequelize");
require("dotenv").config();

const config = {
  database: process.env.DB_NAME || "redit_post_db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  dialect: "postgres",
  logging: true,
};

console.log("Veritabanı bağlantı bilgileri:", config);

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Veritabanı bağlantısı başarıyla kuruldu.");
  })
  .catch((err) => {
    console.error("Veritabanı bağlantısı başarısız:", err);
  });

module.exports = sequelize;
