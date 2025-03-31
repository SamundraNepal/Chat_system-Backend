const userModel = require("./Model/userSchema");
const Post = require("./Model/postSchema");
const Likes = require("./Model/likesSchema");
const Comment = require("./Model/commentSchema");
const Notifications = require("./Model/notificationsSchema");
const Chats = require("./Model/chatsSchema");
const CommentInteractionsLike = require("./Model/commentInteractionsLike");
const CommentInteractionsReply = require("./Model/commentInteractionReply");

function setupAssociations() {
  // User relationships
  userModel.hasMany(Comment, { foreignKey: "senderID" });
  userModel.hasMany(Likes, { foreignKey: "senderID" });
  userModel.hasMany(Post, { foreignKey: "userID" });
  userModel.hasMany(Notifications, { foreignKey: "sender_id" });

  Comment.belongsTo(userModel, { foreignKey: "senderID", as: "user" });
  Likes.belongsTo(userModel, { foreignKey: "senderID", as: "user" });
  Post.belongsTo(userModel, { foreignKey: "userID", as: "user" });
  Notifications.belongsTo(userModel, { foreignKey: "sender_id", as: "user" });

  // Post relationships
  Post.hasMany(Likes, { foreignKey: "postID", as: "likes" });
  Post.hasMany(Comment, { foreignKey: "postID", as: "comments" });
  Likes.belongsTo(Post, { foreignKey: "postID" });
  Comment.belongsTo(Post, { foreignKey: "postID" });

  // Comment interactions
  Comment.hasMany(CommentInteractionsLike, {
    foreignKey: "commentID",
    as: "interactionsLikes",
  });
  CommentInteractionsLike.belongsTo(Comment, { foreignKey: "commentID" });

  Comment.hasMany(CommentInteractionsReply, {
    foreignKey: "commentID",
    as: "interactionsReply",
  });
  CommentInteractionsReply.belongsTo(Comment, { foreignKey: "commentID" });

  userModel.hasMany(CommentInteractionsReply, {
    foreignKey: "senderID",
    as: "sender",
  });

  CommentInteractionsReply.belongsTo(userModel, {
    foreignKey: "senderID",
    as: "sender",
  });

  //chats interactions
  // User can send many chats (as sender)
  userModel.hasMany(Chats, { foreignKey: "senderID", as: "sentChats" });

  // User can receive many chats
  userModel.hasMany(Chats, { foreignKey: "receiverID", as: "receivedChats" });

  // Chat belongs to a sender
  Chats.belongsTo(userModel, { foreignKey: "senderID", as: "sender" });

  // Chat belongs to a receiver
  Chats.belongsTo(userModel, { foreignKey: "receiverID", as: "receiver" });
}

// Export function
module.exports = setupAssociations;
