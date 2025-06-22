const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Like = sequelize.define(
  "Like",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "posts",
        key: "id",
      },
    },
    liked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    value: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: false,
    underscored: true,
    tableName: "likes",
  }
);

// İlişkileri tanımlama
Like.associate = (models) => {
  Like.belongsTo(models.User, {
    foreignKey: "user_id",
  });

  Like.belongsTo(models.Post, {
    foreignKey: "post_id",
  });
};

module.exports = Like;
