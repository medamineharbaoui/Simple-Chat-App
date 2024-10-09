module.exports = (app) => {
  const user = require("../controllers/user.controller.js");

  var router = require("express").Router();

  router.post("/register/", [user.register]);

  router.post("/login/", [user.login]);

  router.get("/user/", [user.checkSessions, user.user]);

  router.get("/logout/", [user.checkSessions, user.logout]);

  router.get("/", [user.checkSessions, user.getUsers]);

  app.use("/api/users", router);
};
