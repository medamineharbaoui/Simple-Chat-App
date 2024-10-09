const db = require("../database/index.js");
const Message = db.message;
const User = db.user;
const { Op } = require("sequelize");
const websocketService = require("../services/websocket.service.js");

// Get messages exchanged with a specific user

function getMessages(request, response) {
  const loggedInUserId = request.session.userId; // Use session to get user ID

  // Check if the user is logged in
  if (!loggedInUserId) {
    return response.status(401).json({
      loggedIn: false, // Return JSON indicating the user is not logged in
    });
  }

  // Get the selected user's ID from the request parameters
  const selectedUserId = request.params.id; // Assuming you're sending the selected user's ID as a URL parameter

  // Fetch messages exchanged between the logged-in user and the selected user
  Message.findAll({
    where: {
      [Op.or]: [
        {
          sender_id: loggedInUserId, // The logged-in user is the sender
          receiver_id: selectedUserId, // The selected user is the receiver
        },
        {
          sender_id: selectedUserId, // The selected user is the sender
          receiver_id: loggedInUserId, // The logged-in user is the receiver
        },
      ],
    },
    order: [["createdAt", "ASC"]], // Order messages by creation time
  })
    .then((messages) => {
      // Format the messages to match the expected response structure
      const formattedMessages = messages.map((message) => ({
        messageId: message.message_id,
        messageSenderId: message.sender_id,
        messageReceiverId: message.receiver_id,
        messageText: message.content,
      }));

      // Send the formatted messages in the 'data' key
      response.json({
        data: formattedMessages,
      });
    })
    .catch((error) => {
      console.error("Error fetching messages:", error.message);
      response.status(500).send({ message: "Failed to fetch messages." });
    });
}

function sendMessages(request, response) {
  // Check if the user is logged in
  if (!request.session || !request.session.userId) {
    return response.status(401).json({
      loggedIn: false, // User is not logged in
    });
  }

  // Destructure the required fields from the request body
  const { messageText, messageReceiverId } = request.body;

  // Validate the request body to ensure messageText and messageReceiverId are provided
  if (!messageReceiverId || !messageText) {
    return response.status(400).json({
      sent: false,
      message: "Receiver ID and message text are required.",
    });
  }

  // Create a new message using sender_id from the session and receiver_id from the request body
  Message.create({
    sender_id: request.session.userId, // Use the logged-in user's ID as the sender
    receiver_id: messageReceiverId, // Get the receiver ID from the request body
    content: messageText, // Get the message text from the request body
    createdAt: new Date(),
  })
    .then(() => {
      response.status(201).json({
        sent: true, // Message was sent successfully
      });
    })
    .catch((error) => {
      console.error("Error sending message:", error.message); // Log specific error message
      response.status(500).json({
        sent: false,
        message: "An error occurred while sending the message.",
      });
    });
}

module.exports = {
  getMessages: getMessages,
  sendMessages: sendMessages,
};
