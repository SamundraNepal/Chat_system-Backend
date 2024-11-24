const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },

    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

User.beforeCreate(async (user, options) => {
  if (user.password) {
    const hasPassword = await bcrypt.hash(user.password, 10);
    user.password = hasPassword;
  }
});

User.prototype.passwordMatch = async function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

module.exports = User;
