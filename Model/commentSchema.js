const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const Comment = sequelize.define(
  "Comment",
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

    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comments",
    timestamps: false,
  }
);

module.exports = Comment;
