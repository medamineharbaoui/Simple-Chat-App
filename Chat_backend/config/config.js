module.exports = {
  database: {
    username: "root",
    password: "root",
    database: "database",
    dialect: "sqlite",
    storage: "orm-db.sqlite",
  },
  server: {
    //process.env.PORT
    port: process.env.PORT || 8080,
  },
  sessionParser: {
    secret: "$secret",
    saveUninitialized: false,
    resave: false,
  },
  websocket: {
    noServer: true,
    path: "/websocket",
  },
};
