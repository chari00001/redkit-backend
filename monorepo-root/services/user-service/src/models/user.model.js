const { DataTypes } = require("sequelize");
const sequelize = require("../db");

/**
 * Kullanıcı modeli
 * Users tablosunu temsil eder
 */
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_picture_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "moderator"),
      defaultValue: "user",
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    account_status: {
      type: DataTypes.ENUM("active", "suspended", "disabled"),
      defaultValue: "active",
      allowNull: false,
    },
    subscription_level: {
      type: DataTypes.ENUM("free", "premium", "pro"),
      defaultValue: "free",
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        push: true,
        in_app: true,
      },
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    subscription_expiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "users",
  }
);

module.exports = User;
