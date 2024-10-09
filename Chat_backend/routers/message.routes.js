module.exports = (app) => {
  const messages = require("../controllers/message.controller.js");
  const user = require("../controllers/user.controller.js");
  var router = require("express").Router();

  router.get("/:id", [user.checkSessions, messages.getMessages]);

  router.post("/", [user.checkSessions, messages.sendMessages]);

  app.use("/api/messages", router);
};
