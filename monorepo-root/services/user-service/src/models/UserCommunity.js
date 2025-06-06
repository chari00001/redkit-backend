const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

/**
 * Kullanıcı-Topluluk ilişki modeli
 * User_Communities tablosunu temsil eder
 */
class UserCommunity extends Model {}

UserCommunity.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      primaryKey: true,
      onDelete: "CASCADE",
    },
    community_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "communities",
        key: "id",
      },
      primaryKey: true,
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "member",
      validate: {
        isIn: [["member", "moderator", "admin"]],
      },
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "user_community",
    tableName: "user_communities",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["community_id", "role"],
        name: "idx_uc_comm_role",
      },
    ],
  }
);

module.exports = UserCommunity;
