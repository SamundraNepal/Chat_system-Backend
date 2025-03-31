const { Respond } = require("../utils/respond");
const User = require("../Model/userSchema");
const Friend = require("../Model/friendSchema");
const { Op } = require("sequelize");

exports.FindFriends = async (req, res) => {
  try {
    const { searchData } = req.body;

    if (!searchData) {
      return Respond(res, 400, "Failed", "No user found");
    }

    const datas = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${searchData}%` } },
          { lastName: { [Op.like]: `%${searchData}%` } },
        ],
      },
    });

    const receivedRequest = await Friend.findAll({
      where: {
        [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
    });

    // this filter out the user data so it wont show the user in the find friend list
    const searchList = datas.filter((el) => el.id != req.user.id);

    if (!datas) {
      return Respond(res, 400, "Failed", "No user found");
    }

    Respond(res, 201, "Success", {
      searchList,
      receivedRequest,
    });
  } catch (err) {
    Respond(res, 400, "Failed", err.message);
  }
};
