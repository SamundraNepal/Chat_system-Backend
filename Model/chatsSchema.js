const { DataTypes, DATE } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const Chats = sequelize.define(
  "Chats",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    receiverID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Chats",
    timestamps: false,
  }
);

module.exports = Chats;
