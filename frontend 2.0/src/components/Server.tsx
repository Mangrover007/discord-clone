import { useState } from "react";
import type { Server as ServerType, User } from "../types/client-types";
import { ServerMessages } from "./ServerMessages";

type ServerProps = {
  activeServer: ServerType | null,
  socket: WebSocket | null | undefined,
  activeUser: User
};

const Server = ({ activeServer, socket, activeUser }: ServerProps) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      type: "server",
      content: message,
      server: activeServer?.name
    }
    socket?.send(JSON.stringify(payload));
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-[#36393F] rounded-md shadow-lg overflow-hidden">
      <h1 className="text-white font-bold p-4 border-b border-[#2F3136]">Server: {activeServer?.name}</h1>

      {/* Chat area */}
      <div className="flex-1 flex flex-col-reverse overflow-y-auto p-4 gap-3 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-[#2F3136]">
        {activeServer?.name && <ServerMessages activeServer={activeServer} activeUser={activeUser}  />}
      </div>

      {/* Input area */}
      <div className="flex p-3 bg-[#40444B] border-t border-[#2F3136]">
        <input
          type="text"
          placeholder="Write a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-[#40444B] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-md text-white font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export { Server };
