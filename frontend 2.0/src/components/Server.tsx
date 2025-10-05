import React, { useEffect, useState, useRef } from "react";
import { type ServerMessage, type Server as ServerType } from "../types";

type ServerProps = {
  setServerList: React.Dispatch<React.SetStateAction<ServerType[]>>,
  name: string,
  activeServer: string,
  socket: WebSocket | null,
  serverMessages: ServerMessage[],
  setServerMessages: React.Dispatch<React.SetStateAction<ServerMessage[]>>,
  activeUser: string
};

const Server = ({ setServerList, name, activeServer, socket, serverMessages, setServerMessages, activeUser }: ServerProps) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getServerList() {
      try {
        const res = await fetch("http://localhost:3000/server", {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch servers");

        const data: ServerType[] = await res.json();
        setServerList(data);
      } catch (err) {
        console.error(err);
      }
    }

    getServerList();
  }, [setServerList]);

  useEffect(() => {
    async function getServerMessages() {
      try {
        const res = await fetch(`http://localhost:3000/server-messages/${activeServer}`, {
          credentials: "include"
        });
        const data = await res.json()
        setServerMessages(data);
      } catch (e) {
        console.log("getServerMessages error", e)
      }
    }
    getServerMessages()
  }, [activeServer])

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      type: "server",
      content: message,
      server: activeServer
    }
    socket?.send(JSON.stringify(payload));
    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [serverMessages]);

  return (
    <div className="flex flex-col h-full bg-[#36393F] rounded-md shadow-lg overflow-hidden">
      <h1 className="text-white font-bold p-4 border-b border-[#2F3136]">Server: {name}</h1>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-[#2F3136]">
        {serverMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "Me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs break-words ${
                msg.sender === activeUser
                  ? "bg-[#5865F2] text-white rounded-br-none"
                  : "bg-[#4F545C] text-white rounded-bl-none"
              }`}
            >
              <span className="opacity-50">
                {msg.sender}:
              </span>
              <br />
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
