import { useContext } from "react";
import { AuthContext } from "../../providers/AuthContextProvider";
import { ChatSvg } from "../../assets/chat";

export default function Navbar() {
  const { authenticated, user, logout } = useContext(AuthContext);

  return (
    <div className="flex justify-between items-center p-5 w-full">
      <div className="flex items-center gap-2">
        <ChatSvg />
        <p className="text-lg font-semibold uppercase tracking-wider text-slate-600">
          Chat
        </p>
      </div>
      {authenticated && user && (
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">Hi, {user.userName}!</p>
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
