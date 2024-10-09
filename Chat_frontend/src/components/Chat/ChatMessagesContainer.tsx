import { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { SendSvg } from "../../assets/send";
import { AuthContext } from "../../providers/AuthContextProvider";
import { ChatContext } from "../../providers/ChatContextProvider";
import useApi from "../../hooks/useApi";
import { MessageApiResponse, Message } from "../../types";
import DownloadIcon from "@mui/icons-material/Download";

export default function ChatMessagesContainer() {
  const { user, checkUserIsLoggedInOnServer } = useContext(AuthContext);
  const {
    selectedUser,
    messagesWithSelectedUser,
    downloadMessages,
    getMessagesWithSelectedUser,
    setMessagesWithSelectedUser,
    websocket, // Add websocket context to handle live updates
  } = useContext(ChatContext);

  const { data: messageResponse, handleFetch: handleFetchMessage } =
    useApi<MessageApiResponse>();

  const [messageText, setMessageText] = useState<string>("");
  const authenticatedUserId = user?.userId;
  const scroll = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (messageText.trim() !== "" && selectedUser?.userId != null) {
      const body = JSON.stringify({
        messageText: messageText,
        messageReceiverId: selectedUser.userId,
        senderId: authenticatedUserId,
      });

      handleFetchMessage({
        url: "/api/messages/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      // Immediately update local messages state for the sender
      const newMessage: Message = {
        messageId: Date.now(), // Temporary ID
        messageText: messageText,
        messageSenderId: authenticatedUserId!,
        messageReceiverId: selectedUser.userId,
      };

      if (selectedUser?.userId != user.userId) {
        setMessagesWithSelectedUser((prevMessages: Message[]) => {
          const updatedMessages = [...prevMessages, newMessage];
          return updatedMessages;
        });
      }

      // Send the message through WebSocket if connected
      if (websocket) {
        websocket.send(
          JSON.stringify({
            receiverId: selectedUser.userId, // Correct key for the receiver
            content: messageText, // Correct key for the message content
          })
        );
      }

      setMessageText(""); // Clear input field after sending
    }
  };

  // Listen for incoming messages through WebSocket
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        console.log("Message received from WebSocket:", event.data); // Inspect the structure

        const parsedMessage = JSON.parse(event.data);
        console.log("Parsed WebSocket message:", parsedMessage);

        if (parsedMessage.status === 4) {
          const { senderId, content } = parsedMessage.message;

          const newMessage: Message = {
            messageId: Date.now(),
            messageText: content,
            messageSenderId: senderId,
            messageReceiverId: authenticatedUserId!, // This is the receiver (your user)
          };

          setMessagesWithSelectedUser((prevMessages: Message[]) => [
            ...prevMessages,
            newMessage,
          ]);
        }
      };
    }
  }, [websocket, authenticatedUserId, setMessagesWithSelectedUser]);

  useEffect(() => {
    checkUserIsLoggedInOnServer(messageResponse);
  }, [messageResponse]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // Fetch messages when a new user is selected
  useEffect(() => {
    if (selectedUser.userId !== -1) {
      getMessagesWithSelectedUser(selectedUser.userId);
    }
  }, [selectedUser]);

  // Automatically scroll to the latest message
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesWithSelectedUser]);

  return (
    <div className="flex flex-col justify-between p-5 h-[500px] rounded bg-slate-300 border-2 border-slate-400">
      {selectedUser.userId > -1 ? (
        <>
          <div className="flex flex-col flex-grow gap-2 rounded p-4 bg-white overflow-auto">
            {messagesWithSelectedUser.map((messageWithSelectedUser) => (
              <div
                key={messageWithSelectedUser.messageId}
                ref={scroll}
                className={`p-2 rounded max-w-xs ${
                  messageWithSelectedUser.messageReceiverId === user.userId
                    ? "place-self-start bg-slate-200"
                    : "place-self-end bg-slate-400"
                }`}
              >
                <p className="text-sm">{messageWithSelectedUser.messageText}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end mt-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow border-2 border-slate-400 rounded p-2"
              placeholder="Type a message..."
            />
            <button className="mx-4" onClick={sendMessage}>
              <SendSvg width={30} height={30} />
            </button>

            <button
              onClick={downloadMessages}
              style={{ display: "flex", alignItems: "center" }}
            >
              <DownloadIcon style={{ marginRight: "8px" }} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center p-10">
          <p className="text-lg">Choose chat to see messages</p>
        </div>
      )}
    </div>
  );
}
