import { ChatContextProvider } from "../../providers/ChatContextProvider";
import UsersList from "./UsersList";
import ChatMessagesContainer from "./ChatMessagesContainer";

export default function Chat() {
  return (
    <ChatContextProvider>
      <div className="flex gap-4 h-full w-full px-10 py-10">
        <div className="w-1/4 bg-slate-300 p-4 rounded border border-slate-400">
          <UsersList />
        </div>

        <div className="w-3/4 bg-white p-4 rounded border border-slate-400">
          <ChatMessagesContainer />
        </div>
      </div>
    </ChatContextProvider>
  );
}
