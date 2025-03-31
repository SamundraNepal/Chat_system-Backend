const path = require("path");
const Post = require("../Model/postSchema");
const Likes = require("../Model/likesSchema");
const Comments = require("../Model/commentSchema");
const Friend = require("../Model/friendSchema");
const User = require("../Model/userSchema");
const CommentsInteractionsLike = require("../Model/commentInteractionsLike");
const CommentsInteractionsReply = require("../Model/commentInteractionReply");

const { Respond } = require("../utils/respond");
const fs = require("fs");
const { Op } = require("sequelize");
const Notifications = require("../Model/notificationsSchema");

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

exports.createAudio = async (req, res) => {
  try {
    if (!req.file) {
      return Respond(res, 400, "failed", "No audio file");
    }

    const audioName = `${Date.now()}_${req.file.originalname}.wav`;
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

    const createUserPost = await Post.create({
      userID: req.user.id,
      audioName: audioName,
      audioLink: audioUrl,
    });

    if (!createUserPost) {
      return Respond(res, 400, "failed", "Failed to add post to the dataBase");
    }

    Respond(res, 200, "Success", "Audio Successfully added to database");
  } catch (err) {
    Respond(res, 400, "failed", "Failed to upload audio " + err.message);
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userData = req.user;

    const posts = await Post.findAll({
      where: { userID: userData.id },
      order: [["createdAt", "DESC"]], // order by createdAT date in descending order // asc stands for ascending order

      //this get the likes and comments based on the post
      include: [
        {
          model: Likes,
          as: "likes",

          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },
          ],
        },
        {
          model: Comments,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },

            {
              model: CommentsInteractionsLike,
              as: "interactionsLikes",
            },
            {
              model: CommentsInteractionsReply,
              as: "interactionsReply",
              include: [
                {
                  model: User,
                  as: "sender", // Ensure this matches the alias in the association
                  attributes: ["id", "firstName", "lastName", "imageURL"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!posts) {
      return Respond(res, 404, "Failed", "Failed to get the posts ");
    }

    Respond(res, 201, "Success", {
      posts,
    });
  } catch (err) {
    console.log(err.message);
    Respond(res, 400, "Failed", "Failed to get the posts ", err.message);
  }
};

exports.getFindFriendPost = async (req, res) => {
  try {
    const userData = req.body.userID;
    const posts = await Post.findAll({
      where: { userID: userData },
      order: [["createdAt", "DESC"]], // order by createdAT date in descending order // asc stands for ascending order

      //this get the likes and comments based on the post
      include: [
        {
          model: Likes,
          as: "likes",

          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },
          ],
        },
        {
          model: Comments,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },

            {
              model: CommentsInteractionsLike,
              as: "interactionsLikes",
            },
            {
              model: CommentsInteractionsReply,
              as: "interactionsReply",
              include: [
                {
                  model: User,
                  as: "sender", // Ensure this matches the alias in the association
                  attributes: ["id", "firstName", "lastName", "imageURL"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!posts) {
      return Respond(res, 404, "Failed", "Failed to get the posts ");
    }

    Respond(res, 201, "Success", { posts });
  } catch (err) {
    console.log(err.message);
    Respond(res, 400, "Failed", "Failed to get the posts ", err.message);
  }
};

exports.createMedaiPost = async (req, res) => {
  try {
    const audioFiles = req.files.audio;
    const imagesFiles = req.files.images;
    const videosFiles = req.files.videos;

    const audiosName = audioFiles ? audioFiles[0].filename : "";

    const imagesName = imagesFiles
      ? imagesFiles?.map((element) => element.filename)
      : [];
    const videoName = videosFiles
      ? videosFiles?.map((element) => element.filename)
      : [];

    const audioUrl = audioFiles?.map((element) => {
      return `${req.protocol}://${req.get("host")}/Storage/audioFiles/${
        element.filename
      }`;
    });

    const imagesUrl = imagesFiles
      ? imagesFiles?.map((element) => {
          return `${req.protocol}://${req.get("host")}/Storage/mediaFiles/${
            element.filename
          }`;
        })
      : [];

    const videosUrl = videosFiles
      ? videosFiles?.map((element) => {
          return `${req.protocol}://${req.get("host")}/Storage/mediaFiles/${
            element.filename
          }`;
        })
      : [];

    const medaiNames = [...imagesName, ...videoName];
    const MediaUrl = [...imagesUrl, ...videosUrl];

    const userPost = await Post.create({
      userID: req.user.id,
      audioName: audiosName,
      mediaName: medaiNames,
      audioLink: audioUrl,
      mediaLink: MediaUrl,
    });

    if (!userPost) {
      return Respond(res, 400, "failed", "Failed to add post to the dataBase");
    }

    Respond(res, 200, "Success", "Post Successfully added to database");
  } catch (err) {
    return Respond(res, 400, "failed", "Failed to upload " + err.message);
  }
};

exports.LikedPost = async (req, res) => {
  try {
    const { tragetUserId, postId } = req.body;
    const { id } = req.user;

    if (!tragetUserId && !postId)
      return Respond(res, 404, "failed", "empty data supplied");

    // check if the like already exits
    const existingLike = await Likes.findOne({
      where: {
        receiverID: tragetUserId,
        senderID: id,
        postID: postId,
      },
    });
    if (existingLike) {
      await Likes.destroy({
        where: {
          receiverID: tragetUserId,
          senderID: id,
          postID: postId,
        },
      });

      await Notifications.destroy({
        where: {
          content_id: postId,
          recipient_id: tragetUserId,
          sender_id: id,
          content_type: "like",
        },
      });
    }
    if (!existingLike) {
      const createLike = await Likes.create({
        receiverID: tragetUserId,
        senderID: id,
        postID: postId,
      });

      const createNotifications = await Notifications.create({
        content_id: postId,
        recipient_id: tragetUserId,
        sender_id: id,
        content_type: "like",
        additional_content: "Liked a post",
        timeStamp: Date.now(),
      });
    }

    Respond(res, 200, "Success", "Like successfull");
  } catch (err) {
    Respond(
      res,
      400,
      "Failed",
      "Failed to like the post because " + err.message
    );
  }
};

exports.feedPosts = async (req, res) => {
  try {
    // get the frn data that has been accepted
    const frnData = await Friend.findAll({
      where: {
        status: "Accepted",
        [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
    });

    //after that filter the our id and then get the other friend id
    const otherUserIds = frnData.map((el) => {
      if (el.senderId === req.user.id) {
        return el.receiverId;
      } else if (el.receiverId === req.user.id) {
        return el.senderId;
      }
    });

    // get the friend data
    const frnIds = otherUserIds.map((el) => el);

    //after that we get the friend respective posts
    const posts = await Post.findAll({
      where: { userID: frnIds },
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
        {
          model: Likes,
          as: "likes",
        },

        {
          model: Comments,
          as: "comments",

          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },
            {
              model: CommentsInteractionsLike,
              as: "interactionsLikes",
            },
            {
              model: CommentsInteractionsReply,
              as: "interactionsReply",
              include: [
                {
                  model: User,
                  as: "sender", // Ensure this matches the alias in the association
                  attributes: ["id", "firstName", "lastName", "imageURL"],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["comments", "interactionsReply", "timeStamp", "ASC"], // ✅ Correct ordering
      ],
    });

    if (!posts) {
      return Respond(res, 400, "Failed", "Friend posts does not exits");
    }

    Respond(res, 201, "Success", posts);
  } catch (err) {
    console.log(err.message);
  }
};

exports.getRequestPost = async (req, res) => {
  try {
    const { content_id } = req.body;

    const post = await Post.findByPk(content_id, {
      include: [
        {
          model: Likes,
          as: "likes",
          where: { postID: content_id },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },
          ],
        },
        {
          model: Comments,
          as: "comments",
          where: { postID: content_id },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "imageURL"],
            },

            {
              model: CommentsInteractionsLike,
              as: "interactionsLikes",
            },
            {
              model: CommentsInteractionsReply,
              as: "interactionsReply",
              include: [
                {
                  model: User,
                  as: "sender", // Ensure this matches the alias in the association
                  attributes: ["id", "firstName", "lastName", "imageURL"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!post) {
      return Respond(res, 400, "Failed", "posts does not exits");
    }

    Respond(res, 200, "Success", post);
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

exports.postComments = async (req, res) => {
  try {
    const { post_id, post_userID } = req.body;

    if (!post_id || !post_userID)
      return Respond(res, 400, "Failed", "No post id detected");

    if (!req.file) {
      return Respond(res, 400, "failed", "No audio file");
    }

    const audioName = `${Date.now()}_${req.file.originalname}Post.wav`;
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

    const createUserComment = await Comments.create({
      senderID: req.user.id,
      receiverID: post_userID,
      postID: post_id,
      content: audioUrl,
    });

    const createNotifications = await Notifications.create({
      content_id: post_id,
      recipient_id: post_userID,
      sender_id: req.user.id,
      content_type: "Comment",
      additional_content: "Commented on your a post",
      timeStamp: Date.now(),
    });

    if (!createUserComment) {
      return Respond(
        res,
        400,
        "failed",
        "Failed to add comment to the dataBase"
      );
    }

    Respond(res, 200, "Success", "Comment Successfully added to database");
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

exports.DeleteComments = async (req, res) => {
  try {
    const { post_id, comment_id, senderID, receiverID } = req.body;

    if (!post_id || !comment_id)
      return Respond(res, 400, "Failed", "No post id detected");

    const deleteNotifications = await Notifications.destroy({
      where: {
        content_id: post_id,
        recipient_id: receiverID,
        sender_id: senderID,
        content_type: "comment",
      },
    });

    const findComment = await Comments.findByPk(comment_id);
    const fileParts = findComment.content.split("/");
    const fileName = fileParts[fileParts.length - 1];

    //delete the file from the storage
    const filePath = path.join(__dirname, "..", "Storage/audioFiles", fileName);

    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully.");
        }
      });
    }

    if (findComment) {
      await findComment.destroy();
      console.log("Comment deleted successfully.");
    } else {
      console.log("Comment not found.");
    }

    Respond(
      res,
      200,
      "Success",
      "Comment Successfully deleted from to database"
    );
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

exports.CommentsInteractionsLike = async (req, res) => {
  try {
    const { post_id, comment_id, comment_user_id } = req.body;

    if (!post_id || !comment_id || !comment_user_id) {
      return Respond(res, 400, "Failed", "Database does not exits");
    }

    const existingLikes = await Notifications.findOne({
      where: {
        content_id: post_id,
        sender_id: req.user.id,
        comment_id: comment_id,
        content_type: "comlike",
      },
    });

    if (existingLikes) {
      await Notifications.destroy({
        where: {
          content_id: post_id,
          sender_id: req.user.id,
          comment_id: comment_id, // Add this
          content_type: "comlike",
        },
      });

      await CommentsInteractionsLike.destroy({
        where: {
          postID: post_id,
          commentID: comment_id,
          senderID: req.user.id,
          content_type: "Like",
        },
      });
    }
    if (!existingLikes) {
      const createNotifications = await Notifications.create({
        content_id: post_id, // this is post id where the comment is commented
        recipient_id: comment_user_id, // this is the user who post that comment
        sender_id: req.user.id, // this is the user who interacted with that comment
        comment_id: comment_id,
        content_type: "comlike",
        additional_content: "liked your comment",
      });

      const createCommentsInteractions = await CommentsInteractionsLike.create({
        postID: post_id,
        commentID: comment_id,
        receiverID: comment_user_id,
        senderID: req.user.id,
        content_type: "Like",
        content: "Liked your comment",
      });
    }

    Respond(res, 200, "Success", "Comment interactions Like is sucessfull");
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

exports.CommentsInteractionsReply = async (req, res) => {
  try {
    const { post_id, comment_id, comment_user_id } = req.body;

    if (!post_id || !comment_id || !comment_user_id) {
      return Respond(res, 400, "Failed", "Database does not exits");
    }

    const data = await createAudioName(req, "commemtreply.wav");

    const createNotifications = await Notifications.create({
      content_id: post_id, // this is post id where the comment is commented
      recipient_id: comment_user_id, // this is the user who post that comment
      sender_id: req.user.id, // this is the user who interacted with that comment
      comment_id: comment_id,
      content_type: "comreply",
      additional_content: "replied your comment",
    });

    const createCommentsInteractions = await CommentsInteractionsReply.create({
      postID: post_id,
      commentID: comment_id,
      receiverID: comment_user_id,
      senderID: req.user.id,
      content_type: "reply", // Double-check this value
      contentName: data.audioName,
      contentURL: data.audioUrl,
    });

    Respond(res, 200, "Success", "Comment reply is sucessfull");
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

//comments likes and reply part
exports.CommentsInteractionsReplyLike = async (req, res) => {
  try {
    const { post_id, comment_id, comment_user_id, parent_id } = req.body;

    if (!post_id || !comment_id || !comment_user_id || !parent_id) {
      return Respond(res, 400, "Failed", "Database does not exits");
    }

    const existingLikes = await Notifications.findOne({
      where: {
        content_id: post_id,
        sender_id: req.user.id,
        recipient_id: comment_user_id,
        comment_id: parent_id,
        content_type: "comlike",
      },
    });

    if (existingLikes) {
      await Notifications.destroy({
        where: {
          content_id: post_id,
          sender_id: req.user.id,
          comment_id: parent_id,
          content_type: "comlike",
        },
      });

      await CommentsInteractionsLike.destroy({
        where: {
          postID: post_id,
          commentID: comment_id,
          senderID: req.user.id,
          parentID: parent_id,
          content_type: "reply-like",
        },
      });
    }
    if (!existingLikes) {
      const createNotifications = await Notifications.create({
        content_id: post_id, // this is post id where the comment is commented
        recipient_id: comment_user_id, // this is the user who post that comment
        sender_id: req.user.id, // this is the user who interacted with that comment
        comment_id: parent_id,
        content_type: "comlike",
        additional_content: "liked your comment",
      });

      const createCommentsInteractions = await CommentsInteractionsLike.create({
        postID: post_id,
        parentID: parent_id,
        commentID: comment_id,
        receiverID: comment_user_id,
        senderID: req.user.id,
        content_type: "reply-like",
        content: "Liked your comment reply",
      });
    }

    Respond(res, 200, "Success", "Comment reply Like is sucessfull");
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to post the comment " + err.message);
  }
};

exports.DeleteCommentsReply = async (req, res) => {
  try {
    const { post_id, comment_id, receiverID, parentID, replyID } = req.body;

    if (!post_id || !comment_id)
      return Respond(res, 400, "Failed", "No post id detected");

    const deleteNotifications = await Notifications.destroy({
      where: {
        content_id: post_id,
        recipient_id: receiverID,
        sender_id: req.user.id,
        comment_id: comment_id,
        content_type: "comreply",
      },
    });

    const findComment = await CommentsInteractionsReply.findByPk(replyID);

    const fileParts = findComment.contentName.split("/");
    const fileName = fileParts[fileParts.length - 1];

    //delete the file from the storage
    const filePath = path.join(__dirname, "..", "Storage/audioFiles", fileName);

    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully.");
        }
      });
    }

    if (findComment) {
      await findComment.destroy();
      await CommentsInteractionsLike.destroy({
        where: {
          postID: post_id,
          commentID: comment_id,
          senderID: req.user.id,
          receiverId: receiverID,
        },
      });
      console.log("Comment deleted successfully.");
    } else {
      console.log("Comment not found.");
    }

    Respond(
      res,
      200,
      "Success",
      "Comment Successfully deleted from to database"
    );
  } catch (err) {
    Respond(res, 400, "Failed", "Failed to get the posts " + err.message);
  }
};

exports.CommentsInteractionsReplyReply = async (req, res) => {
  try {
    const { comment_id, sender, receiver, post_id, parentID } = req.body;

    if (!comment_id || !sender || !receiver || !parentID) {
      return Respond(res, 400, "Failed", "Database does not exits");
    }

    const data = await createAudioName(req, "commemtReplyReply.wav");

    const createNotifications = await Notifications.create({
      content_id: post_id, // this is post id where the comment is commented
      recipient_id: receiver, // this is the user who post that comment
      sender_id: req.user.id, // this is the user who interacted with that comment
      comment_id: parentID,
      content_type: "comreply",
      additional_content: "replied your comment",
    });

    const createCommentsInteractions = await CommentsInteractionsReply.create({
      parentID: parentID,
      postID: post_id,
      commentID: comment_id,
      receiverID: receiver,
      senderID: req.user.id,
      content_type: "reply-reply", // Double-check this value
      contentName: data.audioName,
      contentURL: data.audioUrl,
    });

    Respond(res, 200, "Success", "Comment reply-reply is sucessfull");
  } catch (err) {
    Respond(res, 400, "Failed", "Failed post reply " + err.message);
  }
};
