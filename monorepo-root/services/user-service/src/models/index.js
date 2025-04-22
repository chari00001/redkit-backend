const User = require("./user.model");
const Role = require("./Role");
const Follow = require("./follow.model");
const UserCommunity = require("./UserCommunity");
const UserSubtitle = require("./UserSubtitle");

/**
 * Model ilişkilendirmeleri
 */

// İlişkiler buraya kurulabilir
// Örnek:
User.belongsTo(Role, { foreignKey: "role", targetKey: "name" });

// Takip İlişkileri
User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "followee_id",
  otherKey: "follower_id",
});

User.belongsToMany(User, {
  through: Follow,
  as: "following",
  foreignKey: "follower_id",
  otherKey: "followee_id",
});

Follow.belongsTo(User, {
  foreignKey: "follower_id",
  as: "follower",
});

Follow.belongsTo(User, {
  foreignKey: "followee_id",
  as: "followee",
});

module.exports = {
  User,
  Role,
  Follow,
  UserCommunity,
  UserSubtitle,
};
