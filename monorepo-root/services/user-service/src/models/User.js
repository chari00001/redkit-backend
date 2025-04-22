const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "user",
    },
    profile_picture_url: { type: DataTypes.STRING(255) },
    bio: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING(100) },
    date_of_birth: { type: DataTypes.DATE },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    last_login: { type: DataTypes.DATE },
    notification_preferences: { type: DataTypes.JSON },
    post_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    account_status: {
      type: DataTypes.ENUM("active", "suspended", "deactivated"),
      defaultValue: "active",
    },
    subscription_level: {
      type: DataTypes.ENUM("free", "premium", "vip"),
      defaultValue: "free",
    },
    subscription_expiration: { type: DataTypes.DATE },
  },
  {
    timestamps: false,
    tableName: "Users",
  }
);

module.exports = User;
