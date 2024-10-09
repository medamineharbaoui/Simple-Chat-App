console.log("websocket/communication.js");
const constants = require("../constants/constants.js");

const onlineUsers = {};

function messageNewNotify(id) {
  if (id in onlineUsers) {
    onlineUsers[id].send(
      JSON.stringify({ status: constants.websocket.statuses.MESSAGE_NEW })
    );
  }
}
function messageSentNotify(id) {
  if (id in onlineUsers) {
    onlineUsers[id].send(
      JSON.stringify({ status: constants.websocket.statuses.MESSAGE_SENT })
    );
  }
}

function closeConnectionWithUser(id) {
  if (id in onlineUsers) {
    onlineUsers[id].close();
  }
}

function userIsOnline(id) {
  if (id in onlineUsers) {
    return true;
  }
  return false;
}

module.exports = {
  userIsOnline: userIsOnline,
  messageNewNotify: messageNewNotify,
  messageSentNotify: messageSentNotify,
  closeConnectionWithUser: closeConnectionWithUser,
  onlineUsers: onlineUsers,
};
