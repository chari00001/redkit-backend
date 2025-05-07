const Community = require("./Community");
const UserCommunity = require("./UserCommunity");
const User = require("./User");

// İlişkiler UserCommunity.js içinde tanımlandı
// İlave Creator ilişkisi - onDelete kaskad ayarlandı
Community.belongsTo(User, {
  foreignKey: "creator_id",
  as: "creator",
});

// Model nesnelerini dışa aktarma
module.exports = {
  Community,
  UserCommunity,
  User,
};
