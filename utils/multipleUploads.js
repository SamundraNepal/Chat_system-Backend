const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const MediaDir = path.join(__dirname, "..", "Storage/mediaFiles");
    const AudioDir = path.join(__dirname, "..", "Storage/audioFiles");

    if (file.mimetype.startsWith("image/")) {
      cb(null, MediaDir);
    } else if (file.mimetype.startsWith("audio/")) {
      cb(null, AudioDir);
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, MediaDir);
    } else {
      cb(new Error("Invalid file stype"), false);
    }
  },

  filename: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, `${Date.now()}-${file.originalname}.wav`);
    } else {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  },
});

const filter = (req, file, cb) => {
  const fileTypes = ["image/", "audio/", "video/"];

  if (fileTypes.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error("unSupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter: filter });

const medaiUploadMulter = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "audio", maxCount: 1 },
  { name: "videos", maxCount: 10 },
]);

module.exports = medaiUploadMulter;
