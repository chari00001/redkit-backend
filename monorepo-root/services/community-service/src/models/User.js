const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "user",
      validate: {
        isIn: [["user", "admin", "moderator"]],
      },
    },
    profile_picture_url: {
      type: DataTypes.STRING(255),
    },
    bio: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.STRING(100),
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    notification_preferences: {
      type: DataTypes.JSONB,
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    account_status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
      allowNull: false,
      validate: {
        isIn: [["active", "suspended", "deactivated"]],
      },
    },
    subscription_level: {
      type: DataTypes.STRING(20),
      defaultValue: "free",
      allowNull: false,
      validate: {
        isIn: [["free", "premium", "vip"]],
      },
    },
    subscription_expiration: {
      type: DataTypes.DATEONLY,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
