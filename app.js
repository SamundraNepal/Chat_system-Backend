//project dependency
const express = require("express");
const app = express();

//inheritnace
const userRoutes = require("./Routes/userRoutes");

app.use(express.json()); // Middleware to parse incoming JSON bodies

//allows access to this path files
app.use("/chatMe/v1/users", userRoutes);

module.exports = app;
