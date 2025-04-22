const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Post = sequelize.define(
  "Post",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visibility: {
      type: DataTypes.ENUM("public", "private", "followers"),
      defaultValue: "public",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    allow_comments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shares_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comments_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "posts",
  }
);

// İlişkileri tanımlama
Post.associate = (models) => {
  Post.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "author",
  });

  Post.hasMany(models.Comment, {
    foreignKey: "post_id",
    as: "comments",
  });

  Post.hasMany(models.Like, {
    foreignKey: "post_id",
    as: "likes",
  });

  Post.belongsToMany(models.User, {
    through: models.Like,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "likedBy",
  });
};

module.exports = Post;
