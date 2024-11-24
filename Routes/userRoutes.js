const express = require("express");
const router = express.Router();

const userController = require("../Controller/userController");

router.route("/createUser").post(userController.createUsers);
router.route("/logInUser").post(userController.logInUsers);

module.exports = router;
