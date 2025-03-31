const express = require("express");
const router = express.Router();

const protect = require("../Controller/userController");
const audioUpload = require("../utils/audioUpload");
const mediaUpload = require("../utils/multipleUploads");

const postController = require("../Controller/postController");

router
  .route("/uploadAudio")
  .post(protect.Protect, audioUpload, postController.createAudio);

router.route("/getPosts").get(protect.Protect, postController.getUserPosts);

router
  .route("/getFindFriendPosts")
  .post(protect.Protect, postController.getFindFriendPost);

router
  .route("/uploadMedaiFiles")
  .post(protect.Protect, mediaUpload, postController.createMedaiPost);

router.route("/likedPost").post(protect.Protect, postController.LikedPost);

//get the master feed
router.route("/getFeed").get(protect.Protect, postController.feedPosts);
//get requested post
router.route("/reqpost").post(protect.Protect, postController.getRequestPost);

//post the comments
router
  .route("/postcomment")
  .post(protect.Protect, audioUpload, postController.postComments);

//delete comment
router
  .route("/deleteComment")
  .post(protect.Protect, audioUpload, postController.DeleteComments);

//other like comment
router
  .route("/likeComment")
  .post(protect.Protect, postController.CommentsInteractionsLike);

//other reply comment
router
  .route("/replyComment")
  .post(protect.Protect, audioUpload, postController.CommentsInteractionsReply);

//other reply comment
router
  .route("/commentReplyLikes")
  .post(
    protect.Protect,
    audioUpload,
    postController.CommentsInteractionsReplyLike
  );

router
  .route("/commentReplyDelete")
  .post(protect.Protect, postController.DeleteCommentsReply);

//commets reply

router
  .route("/commetsreplyreply")
  .post(
    protect.Protect,
    audioUpload,
    postController.CommentsInteractionsReplyReply
  );

module.exports = router;
