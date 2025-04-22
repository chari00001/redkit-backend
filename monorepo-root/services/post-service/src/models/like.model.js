const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Like = sequelize.define(
  "Like",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posts",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "likes",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "post_id"],
      },
    ],
  }
);

module.exports = Like;
