const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");
const Community = require("./Community");

const UserCommunity = sequelize.define(
  "UserCommunity",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    community_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "communities",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: "member",
      allowNull: false,
      validate: {
        isIn: [["member", "moderator", "admin"]],
      },
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "user_communities",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: "idx_uc_comm_role",
        fields: ["community_id", "role"],
      },
    ],
  }
);

// İlişkileri tanımla - modeller arası
User.belongsToMany(Community, {
  through: UserCommunity,
  foreignKey: "user_id",
  otherKey: "community_id",
});

Community.belongsToMany(User, {
  through: UserCommunity,
  foreignKey: "community_id",
  otherKey: "user_id",
});

UserCommunity.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

UserCommunity.belongsTo(Community, {
  foreignKey: "community_id",
  targetKey: "id",
});

module.exports = UserCommunity;
