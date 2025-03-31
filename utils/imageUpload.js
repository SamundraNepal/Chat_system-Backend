const multer = require("multer");

storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const userID = req.params.id;
    const userData = req.user;
    const UName = userData?.firstName;
    const UId = userData?.id;

    const combineData = `${UName}-${UId}`;

    cb(null, `Users/${userID != undefined ? userID : combineData}/`);
  },

  filename: async function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `Avatar_${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage: storage }).single("avatar");

exports.uploadAvatar = upload;
