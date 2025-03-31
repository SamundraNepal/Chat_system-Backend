const express = require("express");
const router = express.Router();

const protect = require("../Controller/userController");

const searchController = require("../Controller/searchController");

router
  .route("/findFriends")
  .post(protect.Protect, searchController.FindFriends);

module.exports = router;
