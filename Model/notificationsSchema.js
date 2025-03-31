const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");
const Comment = require("./commentSchema");

const Notifications = sequelize.define(
  "Notifications",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content_type: {
      type: DataTypes.ENUM,
      values: [
        "friend_request",
        "like",
        "comment",
        "message",
        "mention",
        "comlike",
        "comreply",
      ], // Example content types
    },

    comment_id: {
      type: DataTypes.STRING,
    },

    additional_content: {
      type: DataTypes.STRING,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Notifications",
    timestamps: false,
  }
);

module.exports = Notifications;
