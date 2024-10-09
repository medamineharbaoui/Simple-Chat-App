const db = require("../database");
const User = db.user;
const websocketService = require("../services/websocket.service"); // Ensure to import the websocket service for logout

function register(request, response) {
  var userName = request.body.userName;
  var userPassword = request.body.userPassword;
  if (userName && userPassword) {
    User.count({ where: { user_name: userName } }).then((count) => {
      if (count != 0) {
        response.send({ register: false });
      } else {
        User.create({ user_name: userName, user_password: userPassword })
          .then(() => response.send({ register: true }))
          .catch(function (err) {
            response.send({ register: false });
          });
      }
    });
  } else {
    response.send({ register: false });
  }
}

function login(request, response) {
  const userName = request.body.userName;
  const userPassword = request.body.userPassword;

  // Check if username and password were provided
  if (!userName || !userPassword) {
    return response.status(400).send({
      loggedIn: false,
      message: "Username and password are required.",
    });
  }

  // Find user in the database
  User.findAll({
    where: {
      user_name: userName,
      user_password: userPassword,
    },
  })
    .then((users) => {
      if (users.length > 0) {
        // User found, log them in
        request.session.loggedIn = true;
        request.session.userId = users[0].user_id;
        request.session.userName = users[0].user_name;

        response.send({
          loggedIn: true,
          userName: users[0].user_name,
          userId: users[0].user_id,
        });
      } else {
        // No user found, login failed
        response.send({ loggedIn: false, message: "Invalid credentials." });
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      response.status(500).send({ loggedIn: false, message: "Server error." });
    });
}

function user(request, response) {
  if (!request.session.loggedIn) {
    return response
      .status(401)
      .send({ loggedIn: false, message: "User not logged in." });
  }

  response.send({
    loggedIn: request.session.loggedIn,
    userName: request.session.userName,
    userId: request.session.userId,
  });
}

function logout(request, response) {
  // Check if the user is logged in
  if (request.session.loggedIn) {
    // Notify WebSocket clients about the logout
    const userId = request.session.userId; // Get the user ID of the logged-out user
    for (const id in websocketService.onlineUsers) {
      if (websocketService.onlineUsers[id].readyState === WebSocket.OPEN) {
        websocketService.onlineUsers[id].send(
          JSON.stringify({
            status: constants.websocket.statuses.USER_LOGOUT,
            userId: userId, // Include the user ID in the notification
          })
        );
      }
    }

    // Destroy the session
    request.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return response.status(500).send({ loggedIn: false });
      }
      // Respond with loggedIn false
      response.send({ loggedIn: false });
    });
  } else {
    // User is not logged in
    response.send({ loggedIn: false });
  }
}

function checkSessions(request, response, next) {
  if (request.session.loggedIn) {
    next();
  } else {
    response.send({ loggedIn: false });
  }
}

function getUsers(request, response) {
  console.log("Session Data:", request.session);

  // Fetch users from the database
  db.user
    .findAll()
    .then((users) => {
      // Map users to match the required response format
      const formattedUsers = users.map((user) => ({
        userId: user.user_id, // Rename user_id to userId
        userName: user.user_name, // Rename user_name to userName
        userIsOnline: websocketService.onlineUsers[user.user_id] ? true : false, // Rename connected to userIsOnline
      }));

      // Send the response wrapped in a data object
      response.json({ data: formattedUsers });
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      response.status(500).send("Internal server error");
    });
}

module.exports = {
  register: register,
  login: login,
  logout: logout,
  user: user,
  checkSessions: checkSessions,
  getUsers: getUsers,
};
