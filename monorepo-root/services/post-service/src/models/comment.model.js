const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Comment = sequelize.define(
  "Comment",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "comments",
        key: "id",
      },
    },
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "comments",
  }
);

// İlişkileri tanımlama
Comment.associate = (models) => {
  Comment.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "author",
  });

  Comment.belongsTo(models.Post, {
    foreignKey: "post_id",
    as: "post",
  });

  Comment.belongsTo(Comment, {
    foreignKey: "parent_id",
    as: "parent",
  });

  Comment.hasMany(Comment, {
    foreignKey: "parent_id",
    as: "replies",
  });
};

module.exports = Comment;
