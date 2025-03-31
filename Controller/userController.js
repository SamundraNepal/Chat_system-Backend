const { Op, Sequelize, where } = require("sequelize");
const userModel = require("../Model/userSchema");
const Post = require("../Model/postSchema");
const Friend = require("../Model/friendSchema");
const Notifications = require("../Model/notificationsSchema");
const { Respond } = require("../utils/respond");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const User = require("../Model/userSchema");
const Chats = require("../Model/chatsSchema");

const sendEmail = require("../utils/Email");
const { HTML } = require("../utils/EmailHtml");
const bcrypt = require("bcrypt");
const { timeStamp } = require("console");

const createAudioName = async function (req, Namingconvention) {
  const audioName = `${Date.now()}_${req.file.originalname}${Namingconvention}`;
  const outputPath = path.join(
    __dirname,
    "..",
    "Storage/audioFiles",
    audioName
  );

  fs.writeFile(outputPath, req.file.buffer, (err) => {
    if (err) {
      return Respond(res, 400, "failed", "Failed to save audio file");
    }
  });

  const audioUrl = `${req.protocol}://${req.get(
    "host"
  )}/Storage/audioFiles/${audioName}`;

  return { audioName, audioUrl };
};

//create user folder
const createFolder = async function (UserId) {
  const folderName = "Users";
  const converToString = String(UserId.id);

  const userFolder = path.join(
    folderName,
    `${UserId.firstName}-${converToString}`
  );
  try {
    await fs.promises.mkdir(userFolder, { recursive: false });
  } catch (err) {
    console.log("Failed to create folder : " + err.message);
  }
};

const createToken = function (id, Type) {
  return (token = jwt.sign({ id: id }, process.env.JWT_SECRETKEY, {
    expiresIn: Type,
  }));
};

const createCode = function () {
  const x = 100000 + Math.random() * 900000;
  const y = Math.floor(x);

  return y;
};

// create user
exports.createUsers = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      emailAddress,
      gender,
      password,
      confirmPassword,
    } = req.body.data;

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

    const existingUser = await userModel.findOne({
      where: { emailAddress: emailAddress },
    });

    if (existingUser) {
      return Respond(res, 400, "failed", "Email already exist");
    }

    const newUser = await userModel.create({
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: new Date(dateOfBirth),
      phoneNumber: phoneNumber,
      emailAddress: emailAddress,
      gender: gender,
      password: password,
      createdAt: Date.now(),
    });

    //this creates folder for each user id. in this i will save all the user releated files like chat videos or chat images

    await createFolder(newUser);
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

exports.uploadUserAvatar = async (req, res) => {
  try {
    const imageFile = req.file;
    const id = req.params.id.split("-")[1];

    if (!imageFile) {
      return Respond(res, 401, "failed", "no files to upload");
    }

    const createURL = `${req.protocol}://${req.get("host")}/${
      imageFile.destination
    }/${imageFile.filename}`;

    const findUser = await userModel.findByPk(id);

    if (!findUser) {
      return Respond(res, 400, "failed", {
        message: "user does not exists",
      });
    }

    await findUser.update({ imageURL: createURL });

    Respond(res, 201, "Success", {
      message: "photo upload compelete",
    });
  } catch (err) {
    Respond(res, 401, "failed", "failed to upload avatar : " + err.message);
  }
};

exports.logInUsers = async (req, res) => {
  try {
    const { emailAddress, password, phoneNumber } = req.body.data;

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

    const token = createToken({ id: findUser.id }, process.env.JWT_SHORT);

    // create six digits code
    const authCode = createCode();
    const UserName = await findUser.firstName;
    const TypeofEmail = " Authentication code";
    //create html content
    const HtmlContent = HTML(authCode, UserName, TypeofEmail);

    try {
      await sendEmail({
        to: emailAddress,
        subject: "Authentication code",
        html: HtmlContent,
      });
    } catch (err) {
      return Respond(res, 401, "Failed", {
        message: "Failed to send the authentication code",
      });
    }

    await findUser.update({ authCode: authCode });

    res.cookie("short_auth", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
      maxAge: 60 * 60 * 1000, // 1 min expiration
    });

    Respond(res, 201, "Success", { message: "User logged in" });
  } catch (err) {
    res.status(401).json({
      status: "failed",
      message: "Falied to log in " + err.message,
    });
  }
};

exports.AuthCodeCheck = async (req, res) => {
  try {
    const { value0, value1, value2, value3, value4, value5 } = req.body.data;
    const AuthCode = `${value0 + value1 + value2 + value3 + value4 + value5}`;
    const cookies = req.cookies.short_auth;

    const decode = jwt.verify(cookies, process.env.JWT_SECRETKEY);
    const ID = decode.id.id;

    const findUser = await User.findByPk(ID);
    if (Date.now() > findUser.authCodeExpiryTime) {
      return Respond(res, 401, "Failed", {
        message: "Session Expired. Try logging in back again",
      });
    }

    const isMatch = await findUser.authCodeMatch(AuthCode);

    if (!isMatch) {
      return Respond(res, 401, "Failed", {
        message: "Invalid Code.",
      });
    }

    //Create a token
    const token = createToken({ id: findUser.id }, process.env.JWT_LONG);

    //send new cookies
    res.cookie("auth_user", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    // remove the authcode , expdate
    await findUser.update({ authCode: null, authCodeExpiryTime: null });

    Respond(res, 201, "Success", { message: "User logged in" });
  } catch (err) {
    res.status(401).json({
      status: "failed",
      message: "Falied to log in " + err.message,
    });
  }
};

exports.Protect = async (req, res, next) => {
  try {
    const cookie = req.cookies.auth_user;

    if (cookie) {
      const decode = jwt.verify(cookie, process.env.JWT_SECRETKEY);

      if (Math.floor(Date.now() / 1000) > decode.exp) {
        return Respond(res, 401, "failed", "Token expired");
      }

      //find the user and then pass that user to next
      const findUser = await User.findByPk(decode.id.id);

      if (!findUser) {
        return Respond(res, 401, "failed", "User not found");
      }

      req.user = findUser;

      next();
    } else {
      return Respond(res, 401, "failed", "Invalid Token");
    }
  } catch (err) {
    return Respond(res, 401, "failed", "Not logged in " + err.message);
  }
};

exports.AutoLogIn = async (req, res, next) => {
  try {
    const cookie = req.cookies.auth_user;

    if (cookie) {
      const decode = jwt.verify(cookie, process.env.JWT_SECRETKEY);

      if (Math.floor(Date.now() / 1000) > decode.exp) {
        return Respond(res, 401, "failed", "Token expired");
      }

      //find the user and then pass that user to next
      const findUser = await User.findByPk(decode.id.id);

      if (!findUser) {
        return Respond(res, 401, "failed", "User not found");
      }

      req.user = findUser;

      Respond(res, 200, "success", "User is logged in");
    } else {
      return Respond(res, 401, "failed", "Invalid Token");
    }
  } catch (err) {
    return Respond(res, 401, "failed", "Not logged in " + err.message);
  }
};

exports.GetLoggedUserData = async (req, res) => {
  try {
    const loggedUserData = req.user;

    if (!loggedUserData) {
      return Respond(res, 401, "failed", "User does not exits");
    }

    Respond(res, 200, "success", { user: loggedUserData });
  } catch (err) {
    Respond(res, 401, "failed", "Invlaid user data ");
  }
};

exports.GetUserLoggedOut = async (req, res) => {
  try {
    // this will expire Token
    res.cookie("auth_user", "", {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
      maxAge: -1,
    });

    Respond(res, 201, "Success", "User is logged out");
  } catch (err) {
    Respond(res, 401, "failed", "Failed to logged out", err.message);
  }
};

//Reset Password

exports.FindUserAccount = async (req, res) => {
  try {
    const email = req.body.E;

    const findAccount = await User.findOne({ where: { emailAddress: email } });

    if (!findAccount) {
      return Respond(res, 404, "Failed", "Email does not exits");
    }

    //if account exits then generate a auth code
    const authCode = createCode();
    const UserName = await findAccount.firstName;
    const TypeofEmail = " Reset code";

    //create html content
    const HtmlContent = HTML(authCode, UserName, TypeofEmail);

    //send the code as email to the user
    try {
      await sendEmail({
        to: email,
        subject: "Reset Password",
        html: HtmlContent,
      });
    } catch (err) {
      return Respond(res, 401, "Failed", {
        message: "Failed to send the authentication code",
      });
    }

    //create token and send it as a cookie later to verify the user
    const token = createToken({ id: findAccount.id }, process.env.JWT_SHORT);

    res.cookie("password_reset", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
      maxAge: 60 * 60 * 1000, // 1 min expiration
    });

    //hash the code in the database
    await findAccount.update({ passwordResetCode: authCode });

    Respond(res, 201, "Success", "Password reset code sent");
  } catch (err) {
    Respond(res, 401, "failed", "Failed reset the password ", err.message);
  }
};

exports.ResetPassWord = async (req, res) => {
  try {
    const { code, password, confirmPassword } = req.body;

    if (!code) {
      return Respond(res, 404, "Failed", "Invalid Code");
    }
    if (password != confirmPassword) {
      return Respond(res, 404, "Failed", "Password did not match");
    }

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

    //get cookie
    const cookie = req.cookies.password_reset;

    //check if the cookie is valid or not
    if (!cookie) {
      return Respond(res, 404, "Failed", "Invalid Cookie");
    }

    const decode = jwt.verify(cookie, process.env.JWT_SECRETKEY);

    if (Math.floor(Date.now() / 1000) > decode.exp) {
      return Respond(res, 401, "failed", "Token expired");
    }

    //find the user and then pass that user to next
    const findUser = await User.findByPk(decode.id.id);

    if (!findUser) {
      return Respond(res, 401, "failed", "User not found");
    }

    const matchResetCode = await findUser.resetPasswordCodeMatch(code);

    if (!matchResetCode) {
      return Respond(res, 404, "Failed", "Invalid Code");
    }

    //update the password now
    await findUser.update({ password: password });
    await findUser.update({ passwordResetCode: null, expiryTimeDate: null });

    Respond(res, 201, "Success", "Password reset code sent");
  } catch (err) {
    Respond(res, 401, "failed", "Failed reset the password " + err.message);
  }
};

//update passwords
exports.UpdateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const matchPassword = await bcrypt.compare(
      currentPassword,
      req.user.password
    );

    console.log(matchPassword);
    if (!matchPassword) {
      return Respond(res, 401, "failed", "Current password is wrong");
    }

    if (newPassword != confirmPassword) {
      return Respond(res, 401, "failed", "Password did not match");
    }

    if (newPassword.length < 8) {
      return Respond(
        res,
        401,
        "failed",
        "Password must be longer than 8 characters "
      );
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasnumbers = /[0-9]/.test(newPassword);
    const hasUniqueSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase) {
      return Respond(res, 401, "failed", "Password must have one Upper case");
    } else if (!hasLowerCase) {
      return Respond(res, 401, "failed", "Password must have one lower case");
    } else if (!hasnumbers) {
      return Respond(res, 401, "failed", "Password must have one number");
    } else if (!hasUniqueSymbol) {
      return Respond(res, 401, "failed", "Password must have one symbol");
    }

    const findUser = await User.findByPk(req.user.id);

    if (!findUser) {
      return Respond(res, 404, "failed", "User does not exits in the database");
    }

    await findUser.update({ password: newPassword });

    Respond(res, 201, "Success", "Password reset code sent");
  } catch (err) {
    Respond(res, 401, "failed", "Failed reset the password ", err.message);
  }
};

//update profile Picture
exports.UpdateProfilePicture = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    const findUser = await User.findByPk(user.id);

    if (!findUser) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    // Create url // later i will make this one function
    const createURL = `${req.protocol}://${req.get("host")}/${
      req.file.destination
    }/${req.file.filename}`;

    await findUser.update({ imageURL: createURL });

    await Post.create({
      userID: user.id,
      mediaName: ["Profile"],
      mediaLink: [createURL],
    });

    Respond(res, 201, "Success", "Profile picture is updated");
  } catch (err) {
    Respond(
      res,
      401,
      "failed",
      "Failed update the profile picture ",
      err.message
    );
  }
};

//update profile Picture
exports.UpdateBackgroundImage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    const findUser = await User.findByPk(user.id);

    if (!findUser) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    // Create url // later i will make this one function
    const createURL = `${req.protocol}://${req.get("host")}/${
      req.file.destination
    }/${req.file.filename}`;

    await findUser.update({ coverImageURL: createURL });

    await Post.create({
      userID: user.id,
      mediaName: ["Background"],
      mediaLink: [createURL],
    });

    Respond(res, 201, "Success", "Backgorund picture is updated");
  } catch (err) {
    Respond(
      res,
      401,
      "failed",
      "Failed update the Background picture ",
      err.message
    );
  }
};

//update user bio
exports.UpdateBio = async (req, res) => {
  try {
    const user = req.user;
    const { Intro, Location, Education, Home, Hobbies } = req.body;
    const isArray = Array.isArray(Hobbies);

    const _hobbies =
      !isArray &&
      Hobbies.split(/[ ,]+/) // Split by one or more spaces or commas
        .map((hobby) => hobby.trim()) // Trim whitespace from each element
        .filter((hobby) => hobby !== ""); // Remove empty strings

    if (!user) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    const findUser = await User.findByPk(user.id);

    if (!findUser) {
      return Respond(res, 404, "Failed", "User does not exits");
    }

    await findUser.update({
      intro: Intro,
      location: Location,
      education: Education,
      home: Home,
      hobbies: !isArray ? _hobbies.slice(0, 10) : Hobbies,
    });

    Respond(res, 201, "Success", "Bio is updated");
  } catch (err) {
    console.log(err.message);
    Respond(res, 401, "failed", "Failed update the Bio ", err.message);
  }
};

//Add friend
exports.AddFriend = async (req, res) => {
  try {
    const user = req.user;
    const { frnId } = req.body;

    const frnReqDataBase = await Friend.create({
      senderId: user.id,
      receiverId: frnId,
      acceptedDate: null,
    });

    if (!frnReqDataBase) {
      return Respond(
        res,
        400,
        "Failed",
        "Friend request failed to add to the database"
      );
    }

    const createNotifications = await Notifications.create({
      content_id: frnReqDataBase.id,
      recipient_id: frnId,
      sender_id: user.id,
      content_type: "friend_request",
      additional_content: "Pending",
    });

    Respond(res, 201, "Success", "Friend Request is sent");
  } catch (err) {
    console.log(err.message);
    Respond(res, 401, "failed", "Failed update the Bio ", err.message);
  }
};

//Cancel Reuqest
exports.CancleFriendReuqest = async (req, res) => {
  try {
    const { frnId } = req.body;

    const frnReqDataBase = await Friend.destroy({
      where: {
        receiverId: frnId,
      },
    });

    const deleteNotifications = await Notifications.destroy({
      where: { sender_id: req.user.id },
    });

    if (!frnReqDataBase) {
      return Respond(
        res,
        400,
        "Failed",
        "Friend request failed to cancel to the database"
      );
    }

    Respond(res, 201, "Success", "Friend Request is Cancelled");
  } catch (err) {
    Respond(
      res,
      401,
      "failed",
      "Failed Cancel the friend request ",
      err.message
    );
  }
};

//Get friend Request
exports.GetFriendReuqest = async (req, res) => {
  try {
    const FriendRequest = await Friend.findAll({
      where: { receiverId: req.user.id },
    });

    if (!FriendRequest) {
      return Respond(res, 401, "failed", "No friend request avaliable");
    }

    const receiverIds = FriendRequest.map((el) => el.senderId);

    const senderData = await userModel.findAll({
      where: { id: receiverIds },
      attributes: {
        exclude: [
          "expiryTimeDate",
          "passwordResetCode",
          "authCodeExpiryTime",
          "authCode",
          "updatedAt",
          "createdAt",
          "isActive",
          "password",
        ],
      },
    });

    const enrichedFriendRequest = FriendRequest.map((request) => {
      const sender = senderData.find(
        (sender) => sender.id === request.senderId
      );
      const senderPlain = sender ? sender.get({ plain: true }) : null;

      return {
        ...request.dataValues,
        sender: senderPlain,
      };
    });

    Respond(res, 201, "Success", { enrichedFriendRequest });
  } catch (err) {
    console.log(err.message);
    Respond(res, 500, "failed", "Failed get the friend request " + err.message);
  }
};

//Accept friend request

exports.AcceptFrnRequest = async (req, res) => {
  try {
    const { id } = req.body; // receives id from either find friends or notifications

    //find the notifications based on id or content_id
    const notifications = await Notifications.findOne({
      where: { [Op.or]: [{ id: id }, { content_id: id }] },
    });

    //if notifications then update the following stuff
    if (notifications) {
      await notifications.update({
        sender_id: notifications.recipient_id,
        recipient_id: notifications.sender_id,
        additional_content: "Accepted",
      });
    }

    //update the friend request status as well
    const updateFriendDb = await Friend.findByPk(notifications.content_id);

    if (updateFriendDb) {
      await updateFriendDb.update({
        status: "Accepted",
        acceptedDate: Date.now(),
      });
    }

    Respond(res, 201, "Success", "Friend request has been accepted");
  } catch (err) {
    Respond(
      res,
      500,
      "failed",
      "Failed to accept the friend request " + err.message
    );
  }
};

//Get all user notifications
exports.GetUserNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      where: { recipient_id: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: [
              "expiryTimeDate",
              "passwordResetCode",
              "authCodeExpiryTime",
              "authCode",
              "updatedAt",
              "createdAt",
              "isActive",
              "password",
            ],
          },
        },
      ],

      order: [["timeStamp", "DESC"]],
    });

    if (!notifications) {
      return Respond(res, 500, "Failed", "No notifications to display");
    }

    Respond(res, 201, "Success", notifications);
  } catch (err) {
    Respond(res, 500, "Failed", "Failed to get notifications " + err.message);
  }
};

//make notifications read

exports.MakeNotificationsRead = async (req, res) => {
  try {
    const notify = await Notifications.update(
      { is_read: true },
      { where: { recipient_id: req.user.id } }
    );

    Respond(res, 201, "Success", "Notifications has been read");
  } catch (err) {
    Respond(
      res,
      500,
      "Failed",
      "Failed to get notifications to read" + err.message
    );
  }
};

//create chats
exports.CreateChats = async (req, res) => {
  try {
    const { receiverID } = req.body;

    if (!receiverID) {
      return Respond(res, 404, "Failed", "receivcer id is required");
    }

    const audioData = await createAudioName(req, "chats.wav");

    const createChats = await Chats.create({
      senderID: req.user.id,
      receiverID: receiverID,
      contentName: audioData.audioName,
      content: audioData.audioUrl,
      isRead: false,
    });

    Respond(res, 201, "Success", "Chat Message has been sent");
  } catch (err) {
    Respond(
      res,
      500,
      "Failed",
      "Failed to send the chat message " + err.message
    );
  }
};

exports.GetChats = async (req, res) => {
  try {
    const chats = await Chats.findAll({
      where: {
        [Op.or]: [{ senderId: req.user.id }, { receiverID: req.user.id }],
      },

      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "imageURL"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "imageURL"],
        },
      ],
      order: [["timeStamp", "ASC"]],
    });

    // Group messages properly by ensuring the key is always the same for both users
    const groupedMessages = Object.values(
      chats.reduce((acc, msg) => {
        // Ensure the key is the same for both sender-receiver pairs
        const sortedKey = [msg.senderID, msg.receiverID].sort().join("-");

        if (!acc[sortedKey]) {
          acc[sortedKey] = {
            sender: msg.sender,
            receiver: msg.receiver,
            messages: [
              {
                isRead: msg.isRead,
                sender: msg.sender,
                content: msg.content,
                receiver: msg.receiver,
                timeStamp: msg.timeStamp,
              },
            ], // Store messages as an array
            latestMessageTime: msg.timeStamp,
          };
        } else {
          acc[sortedKey].messages.push({
            sender: msg.sender,
            content: msg.content,
            receiver: msg.receiver,
            timeStamp: msg.timeStamp,
            isRead: msg.isRead,
          });

          // Update the latest message time
          if (msg.timeStamp > acc[sortedKey].latestMessageTime) {
            acc[sortedKey].latestMessageTime = msg.timeStamp;
          }
        }

        return acc;
      }, {})
    );

    Respond(res, 201, "Success", groupedMessages);
  } catch (err) {
    Respond(
      res,
      500,
      "Failed",
      "Failed to send the chat message " + err.message
    );
  }
};

//create chats
exports.CreateChatsMedia = async (req, res) => {
  try {
    const { receiverID } = req.body;
    const mediaFiles = req.files.images || req.files.videos;

    if (!receiverID) {
      return Respond(res, 404, "Failed", "receivcer id is required");
    }

    const mediaName = mediaFiles?.map((element) => {
      return element.filename;
    });

    const mediaURL = mediaFiles?.map((element) => {
      return `${req.protocol}://${req.get("host")}/Storage/mediaFiles/${
        element.filename
      }`;
    });

    const createChats = await Chats.create({
      senderID: req.user.id,
      receiverID: receiverID,
      contentName: mediaName[0],
      content: mediaURL[0],
      isRead: false,
    });

    Respond(res, 201, "Success", "Chat Message has been sent");
  } catch (err) {
    Respond(
      res,
      500,
      "Failed",
      "Failed to send the chat message " + err.message
    );
  }
};

//read chats
exports.ReadChats = async (req, res) => {
  try {
    const { senderID } = req.body;

    if (!senderID) {
      Respond(res, 404, "Failed", "message does not exits");
    }
    await Chats.update(
      { isRead: true },
      { where: { senderID: senderID, receiverID: req.user.id, isRead: false } }
    );
    Respond(res, 201, "Success");
  } catch (err) {
    Respond(
      res,
      500,
      "Failed",
      "Failed to send the chat message " + err.message
    );
  }
};
