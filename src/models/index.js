const Post = require("./post.model");
const Comment = require("./comment.model");
const Like = require("./like.model");

// İlişkileri tanımla
const models = {
  Post,
  Comment,
  Like,
};

// Her model için associate metodunu çağır
Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

module.exports = models;
