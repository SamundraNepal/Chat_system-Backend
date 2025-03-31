const multer = require("multer");

const memoryStorage = multer.memoryStorage();
const upload = multer({ memoryStorage });

const uploadAudio = upload.single("audio");
module.exports = uploadAudio;
