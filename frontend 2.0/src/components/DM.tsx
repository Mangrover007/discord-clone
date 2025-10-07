import type React from "react";
import type { User } from "../types/client-types";
import { useEffect, useState, useRef, useContext } from "react";
import { DMMessages } from "./DMMessages";
import { Portal } from "../App";

type DMProps = {
  setUserList: React.Dispatch<React.SetStateAction<User[]>>,

  activeUser: { id: string; username: string },

  socket: WebSocket | null | undefined,

  activeReceiver: User
};

const DM = ({ setUserList, activeUser, socket, activeReceiver }: DMProps) => {
  const [message, setMessage] = useState<string>("");
  const messageArea = useRef<HTMLDivElement>(null);

  const context = useContext(Portal);

  useEffect(() => {
    async function getUserList() {
      try {
        const res = await fetch("http://localhost:3000/users", {
          credentials: "include"
        });
        const data: User[] = await res.json();
        setUserList(data);
      } catch (err) {
        console.error(err);
      }
    }

    getUserList();
  }, [setUserList]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const payload = {
      type: "dm",
      receiver: activeReceiver.username,
      content: message
    }
    socket?.send(JSON.stringify(payload));
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-[#36393F] rounded-md overflow-y-hidden shadow-lg">
      <h1 className="text-white font-bold p-4 border-b border-[#2F3136]">DM with {activeReceiver.username}</h1>

      {/* Messages area */}
      <div className="flex-1 flex flex-col-reverse overflow-auto p-4 gap-3 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-[#2F3136]"
        ref={messageArea}
      >
        {activeReceiver.username && <DMMessages activeReceiver={activeReceiver} activeUser={activeUser.username} />}
      </div>

      {/* Input area */}
      <div className="flex p-3 bg-[#40444B] border-t border-[#2F3136]">
        <input
          type="text"
          placeholder="Write a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-[#40444B] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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

export { DM };
