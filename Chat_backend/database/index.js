const Sequelize = require("sequelize");
const config = require("../config/config.js");

console.log("database index.js");

const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    dialect: config.database.dialect,
    storage: config.database.storage,
    logging: (msg) => console.log(msg), // Logs all SQL queries to console
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./models/user.model.js")(sequelize, Sequelize);
db.message = require("./models/message.model.js")(sequelize, Sequelize);

module.exports = db;
