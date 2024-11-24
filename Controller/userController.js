const { Op } = require("sequelize");
const userModel = require("../Model/userSchema");
const { Respond } = require("../utils/respond");

// create user
exports.createUsers = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      emailAddress,
      password,
      confirmPassword,
    } = req.body;

    if (password.length < 8) {
      return Respond(
        res,
        401,
        "failed",
        "Password must be longer than 8 characters "
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasnumbers = /[0-9]/.test(password);
    const hasUniqueSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return Respond(res, 401, "failed", "Password must have one Upper case");
    } else if (!hasLowerCase) {
      return Respond(res, 401, "failed", "Password must have one lower case");
    } else if (!hasnumbers) {
      return Respond(res, 401, "failed", "Password must have one number");
    } else if (!hasUniqueSymbol) {
      return Respond(res, 401, "failed", "Password must have one symbol");
    }

    if (password != confirmPassword) {
      return Respond(res, 401, "failed", "Password does not match");
    }

    const newUser = await userModel.create({
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: new Date(dateOfBirth),
      phoneNumber: phoneNumber,
      emailAddress: emailAddress,
      password: password,
      createdAt: Date.now(),
    });

    Respond(res, 201, "Success", {
      message: "Account is created",
      data: newUser,
    });
  } catch (err) {
    Respond(
      res,
      401,
      "failed",
      "failed to create account because : " + err.message
    );
  }
};

exports.logInUsers = async (req, res) => {
  try {
    const { emailAddress, password, phoneNumber } = req.body;

    const findUser = await userModel.findOne({
      where: {
        [Op.or]: [
          emailAddress ? { emailAddress: emailAddress } : null,
          phoneNumber ? { phoneNumber: phoneNumber } : null,
        ].filter(Boolean), // Removes any null values from the query
      },
    });

    if (!findUser) {
      return Respond(res, 401, "failed", "Email or phone does not exits");
    }

    const chekPassword = await findUser.passwordMatch(password);

    if (!chekPassword) {
      return Respond(res, 401, "failed", "Incorrect Password");
    }

    Respond(res, 201, "Success", { message: "User logged in" });
  } catch (err) {
    res.status(401).json({
      status: "failed",
      message: "Falied to log in " + err.message,
    });
  }
};
