const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const { Op } = require("sequelize");

const Post = require("./post.model");
const Like = require("./like.model");
const Comment = require("./comment.model");
const CommentLike = require("./comment.model").CommentLike;

// Diğer servisler için dışarıdan referans gösterecek User modeli tanımlama
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);

// İlişkileri tanımla
if (Post.associate) {
  Post.associate({ User, Comment, Like });
}

if (Like.associate) {
  Like.associate({ User, Post });
}

if (Comment.associate) {
  Comment.associate({ User, Post, Comment });
}

if (CommentLike.associate) {
  CommentLike.associate({ User, Comment });
}

module.exports = {
  Post,
  Like,
  Comment,
  CommentLike,
  User,
  Op,
};
