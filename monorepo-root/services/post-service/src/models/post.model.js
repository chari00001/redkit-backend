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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    comments_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    shares_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM("public", "private", "followers"),
      defaultValue: "public",
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    allow_comments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
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
