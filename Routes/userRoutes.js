const express = require("express");
const router = express.Router();

const userController = require("../Controller/userController");
const UploadAvatar = require("../utils/imageUpload");
const audioUpload = require("../utils/audioUpload");
const mediaUpload = require("../utils/multipleUploads");

router.route("/createUser").post(userController.createUsers);
router
  .route("/uploadAvatar/:id")
  .post(UploadAvatar.uploadAvatar, userController.uploadUserAvatar);

router.route("/logInUser").post(userController.logInUsers);
router.route("/AuthUser").post(userController.AuthCodeCheck);
router.route("/autoLogin").get(userController.AutoLogIn);

router
  .route("/getUserData")
  .get(userController.Protect, userController.GetLoggedUserData);

router.route("/userLogOut").get(userController.GetUserLoggedOut);

//Reset password
router.route("/findAccountresetPassword").post(userController.FindUserAccount);
router.route("/resetPassword").post(userController.ResetPassWord);

//update Password
router
  .route("/updatePassword")
  .post(userController.Protect, userController.UpdateUserPassword);

//update profile picture
router
  .route("/updateProfilePicture")
  .post(
    userController.Protect,
    UploadAvatar.uploadAvatar,
    userController.UpdateProfilePicture
  );

//update background image
router
  .route("/updateBackGroundImagePicture")
  .post(
    userController.Protect,
    UploadAvatar.uploadAvatar,
    userController.UpdateBackgroundImage
  );

//update user bio

router
  .route("/updateUserBio")
  .post(userController.Protect, userController.UpdateBio);

//send frn reuqest
router
  .route("/sendFrnReq")
  .post(userController.Protect, userController.AddFriend);

//Cancel frn reuqest
router
  .route("/cancelFrnReq")
  .post(userController.Protect, userController.CancleFriendReuqest);

//Receive frn request
router
  .route("/getFrnReq")
  .get(userController.Protect, userController.GetFriendReuqest);

//accept frn request
router
  .route("/acceptFrnReq")
  .post(userController.Protect, userController.AcceptFrnRequest);

//Receive notifications
router
  .route("/getNotifications")
  .get(userController.Protect, userController.GetUserNotifications);

//read notifications
router
  .route("/readNotifications")
  .get(userController.Protect, userController.MakeNotificationsRead);

//chats
router
  .route("/createChats")
  .post(userController.Protect, audioUpload, userController.CreateChats);

//get chats
router.route("/getChats").get(userController.Protect, userController.GetChats);

// post video and images to chats
router
  .route("/createChatsMedai")
  .post(userController.Protect, mediaUpload, userController.CreateChatsMedia);

// post video and images to chats
router
  .route("/readChats")
  .post(userController.Protect, mediaUpload, userController.ReadChats);

module.exports = router;
