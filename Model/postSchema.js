const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");

const Post = sequelize.define(
  "Posts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    audioName: {
      type: DataTypes.STRING,
    },

    mediaName: {
      type: DataTypes.JSON,
    },

    audioLink: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true,
    },

    mediaLink: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Posts",
    timestamps: false,
  }
);

module.exports = Post;
