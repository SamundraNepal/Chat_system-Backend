const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const Likes = sequelize.define(
  "Likes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    receiverID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    postID: {
      type: DataTypes.INTEGER,
    },
    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "likes",
    timestamps: false,
  }
);

module.exports = Likes;
