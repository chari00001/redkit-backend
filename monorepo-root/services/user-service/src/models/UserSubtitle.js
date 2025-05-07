const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

/**
 * Kullanıcı-Subtitle ilişki modeli
 * User_Subtitles tablosunu temsil eder
 */
class UserSubtitle extends Model {}

UserSubtitle.init(
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
    subtitle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subtitles",
        key: "id",
      },
      primaryKey: true,
      onDelete: "CASCADE",
    },
    subscribed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "user_subtitle",
    tableName: "user_subtitles",
    timestamps: false,
    underscored: true,
  }
);

module.exports = UserSubtitle;
