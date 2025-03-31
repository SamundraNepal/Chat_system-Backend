const { DataTypes } = require("sequelize");
const sequelize = require("../DataBase/dataBaseConnection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    imageURL: {
      type: DataTypes.STRING,
    },

    coverImageURL: {
      type: DataTypes.STRING,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    intro: {
      type: DataTypes.STRING,
    },

    location: {
      type: DataTypes.STRING,
    },

    education: {
      type: DataTypes.STRING,
    },

    home: {
      type: DataTypes.STRING,
    },

    hobbies: {
      type: DataTypes.JSON,
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

    authCode: {
      //this is for 6 auth code
      type: DataTypes.STRING,
    },

    authCodeExpiryTime: {
      //this is for 6 auth code
      type: DataTypes.STRING,
    },

    passwordResetCode: {
      // this is for password reset code
      type: DataTypes.STRING,
    },

    expiryTimeDate: {
      //this is for 4 auth code
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

//for password
User.beforeCreate(async (user, options) => {
  try {
    if (user.password) {
      const hasPassword = await bcrypt.hash(user.password, 10);
      user.password = hasPassword;
    }
  } catch (err) {
    console.log("Failed to do beforeCreate ", err.message);
  }
});

// hash the code
User.beforeUpdate(async (user, options) => {
  try {
    if (user.authCode) {
      const hasAuthCode = await crypto
        .createHash("sha256")
        .update(String(user.authCode))
        .digest("hex");

      user.authCode = hasAuthCode;
      user.authCodeExpiryTime = Date.now() + 3 * 60 * 1000; // 3 mins expiry time
    }

    if (user.passwordResetCode) {
      const hashpasswordResetCode = await crypto
        .createHash("sha256")
        .update(String(user.passwordResetCode))
        .digest("hex");

      user.passwordResetCode = hashpasswordResetCode;
      user.expiryTimeDate = Date.now() + 1 * 60 * 1000; // 1 mins expiry time
    }

    if (user.changed("password")) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    }
  } catch (err) {
    console.log("Failed to do beforeUpdate ", err.message);
  }
});

//check if password match
User.prototype.passwordMatch = async function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

//check if auth code match

User.prototype.authCodeMatch = async function (AuthCode) {
  const hasAuthCode = await crypto
    .createHash("sha256")
    .update(AuthCode)
    .digest("hex");

  return hasAuthCode === this.authCode;
};

//check if passwordReset code match
User.prototype.resetPasswordCodeMatch = async function (passwordResetCode) {
  const haspasswordResetCode = await crypto
    .createHash("sha256")
    .update(passwordResetCode)
    .digest("hex");

  return haspasswordResetCode === this.passwordResetCode;
};

module.exports = User;
