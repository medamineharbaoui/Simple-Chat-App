const registerButton = document.querySelector("#register-button");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const getUsersButton = document.querySelector("#get-users-button");
const getUserButton = document.querySelector("#get-user-button");
const wsConnectButton = document.querySelector("#ws-connect-button");
const sendMessageButton = document.querySelector("#send-message-button");
const getMessageButton = document.querySelector("#get-messages-button");
const outputMessages = document.querySelector("#output-messages");

const userName = document.getElementById("user-name");
const userPassword = document.getElementById("user-password");
const messageUserId = document.getElementById("message-user-id");
const messageText = document.getElementById("message-text");

function showMessage(message) {
  outputMessages.textContent += `\n${message}`;
  outputMessages.scrollTop = outputMessages.scrollHeight;
}

function handleResponse(response) {
  return response.ok
    ? response.json().then((data) => JSON.stringify(data, null, 2))
    : Promise.reject(new Error("Unexpected response"));
}

registerButton.onclick = function () {
  fetch("/api/users/register", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: userName.value,
      userPassword: userPassword.value,
    }),
  })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

loginButton.onclick = function () {
  fetch("/api/users/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: userName.value,
      userPassword: userPassword.value,
    }),
  })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

logoutButton.onclick = function () {
  fetch("/api/users/logout", { method: "GET", credentials: "same-origin" })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

getUserButton.onclick = function () {
  fetch("/api/users/user", { method: "GET", credentials: "same-origin" })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

getUsersButton.onclick = function () {
  fetch("/api/users", { method: "GET", credentials: "same-origin" })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

let ws;

wsConnectButton.onclick = function () {
  if (ws) {
    ws.onerror = ws.onopen = ws.onclose = null;
    ws.close();
  }

  ws = new WebSocket("ws://localhost:8080/websocket");
  ws.onerror = function (e) {
    showMessage("WebSocket error: " + e.message);
  };
  ws.onopen = function () {
    showMessage("WebSocket connection established");
  };
  ws.onclose = function () {
    showMessage("WebSocket connection closed");
    ws = null;
  };
  ws.onmessage = function (message) {
    showMessage(message.data);
  };
};

getMessageButton.onclick = function () {
  fetch("/api/messages/" + messageUserId.value, {
    method: "GET",
    credentials: "same-origin",
  })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};

sendMessageButton.onclick = function () {
  fetch("/api/messages", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messageText: messageText.value,
      messageReceiverId: messageUserId.value,
    }),
  })
    .then(handleResponse)
    .then(showMessage)
    .catch(function (err) {
      showMessage(err.message);
    });
};
