const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const FriendList = sequelize.define(
  "FriendList",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },

    acceptedDate: {
      type: DataTypes.DATE,
    },

    requestedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "friendList",
    timestamps: false,
  }
);

module.exports = FriendList;
