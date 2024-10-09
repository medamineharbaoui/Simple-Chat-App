const express = require("express");
const cors = require("cors");
const session = require("express-session");
const config = require("./config/config.js");
const db = require("./database/index.js");
const websocket = require("./websocket/index.js");

const app = express();
const server = app.listen(config.server.port, () =>
  console.log(`Listening on port ${config.server.port}`)
);

//CORS CONFIG
const corsOptions = {
  origin: "http://localhost:5173", // frontend URL
  credentials: true, // Allow credentials
};

// Configure session middleware
const sessionParser = session({
  secret: config.sessionParser.secret, //  secure secret
  resave: false,
  saveUninitialized: true,
});

// Middleware setup
app.use(cors(corsOptions)); // just to allow the frontend
app.use(sessionParser); // Session middleware
app.use(express.json()); // JSON parsing middleware

// Database authentication and synchronization
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Sync database models
db.sequelize
  .sync({ force: false }) // Use { force: true } cautiously during development
  .then(() => {
    console.log("Synced db.");
    // Create a test user if no users exist
    return db.user.findOrCreate({
      where: { user_name: "test" },
      defaults: { user_password: "test" },
    });
  })
  .then(() => console.log("Test user created or already exists."))
  .catch((err) => {
    console.error("Failed to sync db:", err.message);
  });

// Initialize WebSocket server
websocket(server, sessionParser);

// Import routes
require("./routers/message.routes.js")(app);
require("./routers/test.routes.js")(app);
require("./routers/user.routes.js")(app);

// Serve static files
app.use(express.static(__dirname + "/public/"));

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
