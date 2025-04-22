const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

/**
 * Takip modeli
 * Follows tablosunu temsil eder
 */
class Follow extends Model {}

Follow.init(
  {
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    followee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    followed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "follow",
    tableName: "follows",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "followee_id"],
      },
    ],
  }
);

module.exports = Follow;
