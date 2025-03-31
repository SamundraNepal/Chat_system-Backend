//project dependency
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
//inheritnace
const userRoutes = require("./Routes/userRoutes");
const audioRoutes = require("./Routes/postRoutes");
const searchRoutes = require("./Routes/searchRoutes");

// Middleware to parse incoming JSON bodies
app.use(express.json());
//MiddleWare to parse incoming cookies
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

//allows access to this path files
app.use("/chatMe/v1/users", userRoutes);
app.use("/tarang/v1/post", audioRoutes);
app.use("/tarang/v1/search", searchRoutes);

//allows access to this path files
app.use("/Users", express.static(path.join(__dirname, "Users")));
app.use("/Storage", express.static(path.join(__dirname, "Storage")));

module.exports = app;
