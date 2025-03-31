const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const { Sequelize } = require("sequelize");

//create sequelize instance
const sequelize = new Sequelize(
  process.env.SQL_DATABASE,
  "root",
  process.env.SQL_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    logging: false,
  }
);

module.exports = sequelize;
