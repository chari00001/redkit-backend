const User = require("./User");
const Role = require("./Role");
const Follow = require("./Follow");
const UserCommunity = require("./UserCommunity");
const UserSubtitle = require("./UserSubtitle");
const Subtitle = require("./Subtitle");

/**
 * Model ilişkilendirmeleri
 */

// Rol ilişkileri
// Not: Doğrudan bir referans yerine sadece ilişkisel referans kuruyoruz
// Kullanıcı-Rol ilişkisi (Rol adına göre bağlantı - basit ilişki)
// Bu şekilde User.role alanı Role.name alanına referans verir, ama SQL seviyesinde foreign key olmaz
User.belongsTo(Role, {
  foreignKey: "role",
  targetKey: "name",
  as: "userRole",
  constraints: false, // Veritabanı seviyesinde foreign key constraint oluşturma
});

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

// UserCommunity ilişkileri
User.hasMany(UserCommunity, {
  foreignKey: "user_id",
  as: "communityMemberships",
});

UserCommunity.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Subtitle ilişkileri
User.belongsToMany(Subtitle, {
  through: UserSubtitle,
  foreignKey: "user_id",
  otherKey: "subtitle_id",
  as: "subtitles",
});

Subtitle.belongsToMany(User, {
  through: UserSubtitle,
  foreignKey: "subtitle_id",
  otherKey: "user_id",
  as: "subscribers",
});

// UserSubtitle ilişkileri
UserSubtitle.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

UserSubtitle.belongsTo(Subtitle, {
  foreignKey: "subtitle_id",
  as: "subtitle",
});

module.exports = {
  User,
  Role,
  Follow,
  UserCommunity,
  UserSubtitle,
  Subtitle,
};
