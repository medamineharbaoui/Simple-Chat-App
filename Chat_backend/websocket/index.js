/*
module.exports = (server, sessionParser) => {
  const WebSocket = require("ws");
  const config = require("../config/config.js");
  const constants = require("../constants/constants.js");
  const websocketService = require("../services/websocket.service.js");

  const wss = new WebSocket.Server({
    noServer: config.websocket.noServer,
    path: config.websocket.path,
  });

  server.on("upgrade", function (request, socket, head) {
    sessionParser(request, {}, () => {
      if (!request.session.userId) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", function (ws, request) {
    console.log(`User connected: ${request.session.userId}`); // Log user connection
    // Notify the newly connected user
    ws.send(
      JSON.stringify({ status: constants.websocket.statuses.USER_LOGIN })
    );

    // Store the WebSocket connection for the user
    websocketService.onlineUsers[request.session.userId] = ws;

    ws.on("message", function (message) {
      console.log(
        `Message received from user ${request.session.userId}: ${message}`
      ); // Log received message
      try {
        var data = JSON.parse(message);
        // Handle incoming messages here
      } catch (error) {
        console.error("Invalid message received:", error);
        return;
      }
    });

    ws.on("close", () => {
      console.log(`User disconnected: ${request.session.userId}`); // Log user disconnection
      // Remove user from online users on disconnect
      delete websocketService.onlineUsers[request.session.userId];

      // Notify all clients about the user logout
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              status: constants.websocket.statuses.USER_LOGOUT,
              userId: request.session.userId, // Include user ID in the logout notification
            })
          );
        }
      });
    });
  });

  return {
    wss: wss,
  };
};
*/

module.exports = (server, sessionParser) => {
  const WebSocket = require("../node_modules/ws/index.js");
  const config = require("../config/config.js");
  const constants = require("../constants/constants.js");
  const websocketService = require("../services/websocket.service.js");

  const wss = new WebSocket.Server({
    noServer: config.websocket.noServer,
    path: config.websocket.path,
  });

  server.on("upgrade", function (request, socket, head) {
    sessionParser(request, {}, () => {
      if (!request.session.userId) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", function (ws, request) {
    const userId = request.session.userId;

    // Notify the newly connected user (Status 1)
    ws.send(
      JSON.stringify({ status: constants.websocket.statuses.USER_LOGIN })
    );

    // Store the WebSocket connection for the user
    websocketService.onlineUsers[userId] = ws;

    ws.on("message", function (message) {
      try {
        const data = JSON.parse(message);

        if (!data.receiverId || !data.content) {
          ws.send(JSON.stringify({ error: "Invalid message format" }));
          return;
        }

        const { receiverId, content } = data;
        const receiverSocket = websocketService.onlineUsers[receiverId];

        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(
            JSON.stringify({
              status: constants.websocket.statuses.MESSAGE_NEW,
              message: {
                senderId: userId,
                content: content,
              },
            })
          );
        }

        ws.send(
          JSON.stringify({
            status: constants.websocket.statuses.MESSAGE_SENT,
            message: {
              receiverId: receiverId,
              content: content,
            },
          })
        );
      } catch (error) {
        console.error("Invalid message received:", error);
        ws.send(JSON.stringify({ error: "Failed to process the message" }));
      }
    });

    ws.on("close", () => {
      // Remove user from online users on disconnect
      delete websocketService.onlineUsers[userId];

      // Notify all clients about the user logout (Status 2)
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              status: constants.websocket.statuses.USER_LOGOUT,
              userId: userId, // Include user ID in the logout notification
            })
          );
        }
      });
    });
  });

  return {
    wss: wss,
  };
};
