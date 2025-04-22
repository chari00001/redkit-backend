const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Follow = sequelize.define('Follow', {
  follower_id: { type: DataTypes.INTEGER, primaryKey: true },
  followee_id: { type: DataTypes.INTEGER, primaryKey: true },
  followed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'Follows'
});

module.exports = Follow;
