import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { DataApiResponse, Message, User, WebSocketApiMessage } from "../types";
import useApi from "../hooks/useApi";
import { AuthContext } from "./AuthContextProvider";

const WEBSOCKET_STATUS_USER_LOGIN = 1;
const WEBSOCKET_STATUS_USER_LOGOUT = 2;
const WEBSOCKET_STATUS_MESSAGE_SENT = 3;
const WEBSOCKET_STATUS_MESSAGE_NEW = 4;

interface ChatContextProviderProps {
  children?: ReactNode;
}

interface ChatContextProps {
  users: User[];
  selectedUser: User;
  messagesWithSelectedUser: Message[];
  setSelectedUser: (selectedUser: User) => void;
  downloadMessages: () => void;
  getMessagesWithSelectedUser: (userId: number) => void;
  setMessagesWithSelectedUser: (messages: Message[]) => void;
  sendMessage: (message: Message) => void; // New method to send messages
  websocket: WebSocket | null;
}

const INITIAL_VALUES = {
  users: [],
  selectedUser: { userId: -1, userName: "" },
  messagesWithSelectedUser: [],
  setSelectedUser: () => {},
  downloadMessages: () => {},
  getMessagesWithSelectedUser: () => {},
  setMessagesWithSelectedUser: () => {},
  sendMessage: () => {}, // Add this
  websocket: null,
};

export const ChatContext = createContext<ChatContextProps>(INITIAL_VALUES);

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  const { authenticated } = useContext(AuthContext);

  const [users, setUsers] = useState<User[]>(INITIAL_VALUES.users);
  const [selectedUser, setSelectedUser] = useState(INITIAL_VALUES.selectedUser);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [lastWebsocketMessage, setLastWebsocketMessage] =
    useState<WebSocketApiMessage>();
  const [messagesWithSelectedUser, setMessagesWithSelectedUser] = useState<
    Message[]
  >(INITIAL_VALUES.messagesWithSelectedUser);

  const { data: usersData, handleFetch: handleFetchUsers } =
    useApi<DataApiResponse<User>>();
  const { data: messagesData, handleFetch: handleFetchMessages } =
    useApi<DataApiResponse<Message>>();

  const openWebSocket = () => {
    if (websocket) return; // Prevent multiple connections

    const socket = new WebSocket("ws://localhost:8080/websocket");

    socket.addEventListener("message", (event) => {
      console.log("Socket : Add Event Listener");
      try {
        const message: WebSocketApiMessage = JSON.parse(event.data);
        setLastWebsocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    setWebsocket(socket);
  };

  const sendMessage = (message: Message) => {
    console.log("sending from sendMessage on ContextProvider");
    if (websocket) {
      websocket.send(
        JSON.stringify({
          status: WEBSOCKET_STATUS_MESSAGE_SENT,
          ...message,
        })
      );
      // Optionally update local state immediately
      // setMessagesWithSelectedUser((prevMessages) => [...prevMessages, message]);
    }
  };

  const getUsers = () => {
    handleFetchUsers({
      url: "/api/users/",
    });
  };

  const getMessagesWithSelectedUser = (userId: number) => {
    handleFetchMessages({
      url: `/api/messages/${userId}`, // Update the endpoint to match your API
    });
  };

  const downloadMessages = () => {
    const blob = new Blob([JSON.stringify(messagesWithSelectedUser)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser?.userName || "messages"}.json`; // Name the downloaded file
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (authenticated) {
      getUsers();
      openWebSocket(); // Open WebSocket connection when user logs in
    }
  }, [authenticated]);

  useEffect(() => {
    if (selectedUser.userId !== -1) {
      getMessagesWithSelectedUser(selectedUser.userId);
    } else {
      setMessagesWithSelectedUser([]); // Clear messages when no user is selected
    }
  }, [selectedUser]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData?.data);
    }
  }, [usersData]);

  useEffect(() => {
    if (lastWebsocketMessage) {
      if (
        lastWebsocketMessage.status === WEBSOCKET_STATUS_USER_LOGIN ||
        lastWebsocketMessage.status === WEBSOCKET_STATUS_USER_LOGOUT
      ) {
        getUsers(); // Update the user list when a user logs in or out
      }
    }
  }, [lastWebsocketMessage]);

  useEffect(() => {
    if (messagesData) {
      setMessagesWithSelectedUser(messagesData?.data);
    }
  }, [messagesData]);

  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        messagesWithSelectedUser,
        setSelectedUser,
        downloadMessages,
        getMessagesWithSelectedUser,
        setMessagesWithSelectedUser,
        sendMessage, // Add sendMessage to context
        websocket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
