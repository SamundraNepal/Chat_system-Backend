const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const CommentInteractionsReply = sequelize.define(
  "CommentInteractionsReply",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    parentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    postID: {
      type: DataTypes.INTEGER,
    },

    commentID: {
      type: DataTypes.INTEGER,
    },

    receiverID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content_type: {
      type: DataTypes.ENUM,
      values: ["reply", "reply-reply"], // Example content types
      allowNull: false,
    },
    contentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    contentURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "CommentInteractionsReply",
    timestamps: false,
  }
);

module.exports = CommentInteractionsReply;
