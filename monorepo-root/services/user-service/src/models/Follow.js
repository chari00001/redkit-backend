const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Follow = sequelize.define(
  "Follow",
  {
    follower_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    followee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    followed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "follows",
    underscored: true,
    indexes: [
      {
        fields: ["followee_id"],
      },
    ],
  }
);

// Takipçinin kendini takip etmesini engelle
Follow.beforeValidate((follow) => {
  if (follow.follower_id === follow.followee_id) {
    throw new Error("Users cannot follow themselves");
  }
});

module.exports = Follow;
