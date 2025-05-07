const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

/**
 * Altyazı modeli
 * Subtitles tablosunu temsil eder
 */
class Subtitle extends Model {}

Subtitle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "subtitle",
    tableName: "subtitles",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Subtitle;
