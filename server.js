const app = require("./app");
const dotenv = require("dotenv");
const sequelize = require("./DataBase/dataBaseConnection");
const userModel = require("./Model/userSchema");

//this ref to the env path
dotenv.config({ path: "./config.env" });

async function ConnectToTheDataBase() {
  try {
    await sequelize.authenticate();
    console.log("connection to SQL database is successfull");

    //this will create the sql table based on the defined model
    await sequelize.sync({ force: false }); // Sequelize looks at the models and creates tables

    app.listen(process.env.PORT, () => {
      console.log(`server is listening port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("unable to connect to the dataBase", err.message);
  }
}

ConnectToTheDataBase();

app.get("/", (req, res) => {
  res.send("Hello from the server");
});
