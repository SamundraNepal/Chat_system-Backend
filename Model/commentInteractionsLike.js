const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const CommentInteractionsLike = sequelize.define(
  "CommentInteractionsLike",
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
      values: ["Like", "reply-like"], // Example content types

      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "CommentInteractionsLike",
    timestamps: false,
  }
);

module.exports = CommentInteractionsLike;
