import { useEffect, useState } from "react";
import type { Server } from "../types";

type JoinServerProps = {
  serverList: Server[];
  activeUser: string;
  socket: WebSocket | null;
};

const JoinServer = ({ activeUser, socket }: JoinServerProps) => {
  const [allServers, setAllServers] = useState<Server[]>([]);

  async function getAllServers() {
    const res = await fetch("http://localhost:3000/server/all", {
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    setAllServers(data);
  }

  useEffect(() => {
    getAllServers();
  }, []);

  const handleServerJoin = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const button = e.target as HTMLButtonElement;
    const payload = {
      type: "server-join",
      username: activeUser,
      serverName: button.name,
    };
    socket?.send(JSON.stringify(payload));
    console.log("joining server or what now?", button.name);
  };

  return (
    <div className="grid place-items-center h-full bg-[#1e1f22]">
      <div className="bg-[#2b2d31] text-gray-200 p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-2 text-gray-100 text-center">
          Join a Server
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Select a server below and click “Join” to enter
        </p>

        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-[#2f3136]">
          {allServers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No servers available
            </div>
          ) : (
            allServers.map((server) => (
              <div
                key={server.name}
                className="flex items-center justify-between bg-[#1e1f22] p-3 rounded-lg border border-[#383a40] hover:border-[#5865f2] transition"
              >
                <span className="font-medium text-gray-100">{server.name}</span>
                <button
                  onClick={(e) => handleServerJoin(e)}
                  name={server.name}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded-md text-sm font-medium transition active:scale-95"
                >
                  Join
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export { JoinServer };
