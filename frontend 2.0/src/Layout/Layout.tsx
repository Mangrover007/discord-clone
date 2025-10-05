import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DM } from "../components/DM";
import { Server } from "../components/Server";

import { type User, type Server as ServerType, type DMMessage, type DMMessageFromServer, type ServerMessage } from "../types";
import { CreateServer } from "../components/CreateServer";
import { JoinServer } from "../components/JoinServer";

type LayoutProps = {
  socket: WebSocket | null,
  DMs: DMMessage[],
  setDMs: React.Dispatch<React.SetStateAction<DMMessage[]>>,
  serverList: ServerType[],
  setServerList: React.Dispatch<React.SetStateAction<ServerType[]>>,
  userList: User[],
  setUserList: React.Dispatch<React.SetStateAction<User[]>>,
  serverMessages: ServerMessage[],
  setServerMessages: React.Dispatch<React.SetStateAction<ServerMessage[]>>
}

const Layout = ({ socket, DMs, setDMs, serverList, setServerList, setUserList, userList, serverMessages, setServerMessages }: LayoutProps) => {
  
  const [activeUser, setActiveUser] = useState<{ id: string; username: string }>({ id: "", username: "" });
  const [activeServer, setActiveServer] = useState("");
  const [activeReceiver, setActiveReceiver] = useState("");

  const [mode, setMode] = useState<"user" | "server" | "create" | "join">("user");

  async function getUser() {
    const res = await fetch("http://localhost:3000/auth/who", {
      credentials: "include",
      method: "GET",
    });
    const data: { id: string; username: string } = await res.json();
    setActiveUser(data);
  }

  useEffect(() => {
    if (!activeUser)
      getUser();
  }, [activeUser]);

  useEffect(() => {
    getUser()
  }, []);

  const handleRedirect = (modeName: "user" | "server" | "create" | "join") => {
    setMode(modeName);
  };

  async function RefreshTokens() {
    try {
      await fetch("http://localhost:3000/auth/refresh-token", {
        credentials: "include",
        method: "GET",
      });
      await getUser();
    }
    catch (e) {
      console.log("error info: ", e)
    }
  }

  async function handleReceiverChange(user: User) {
    setActiveReceiver(user.username)
    const res = await fetch(`http://localhost:3000/dms/${user.username}`, {
      credentials: "include",
      method: "GET"
    })
    const data: DMMessageFromServer[] = await res.json();
    const temp = data.map(message => {
      const { content, sender, receiver } = message;
      return {
        content: content,
        sender: sender,
        receiver: receiver
      }
    })
    setDMs(temp)
    console.log(activeUser);
  }

  async function handleServerChange(server: ServerType) {
    setActiveServer(server.name)
  }

  return (
    <div className="grid grid-cols-[100px_280px_1fr] h-screen bg-[#36393F] text-white">
      {/* Left Sidebar */}
      <div className="bg-[#202225] flex flex-col items-center py-4 border-r border-[#2f3136]">
        <h1 className="text-xs font-bold mb-6 uppercase text-gray-400">Nav</h1>
        <div className="flex flex-col gap-3 w-full px-2">
          <button
            className={`p-2 rounded-lg hover:bg-[#5865F2] transition ${mode === "user" ? "bg-[#5865F2]" : ""
              }`}
            onClick={() => handleRedirect("user")}
            name="user"
          >
            DMs
          </button>
          <button
            className={`p-2 rounded-lg hover:bg-[#5865F2] transition ${mode === "server" ? "bg-[#5865F2]" : ""
              }`}
            onClick={() => handleRedirect("server")}
            name="server"
          >
            Servers
          </button>
          <button onClick={() => handleRedirect("create")}
            className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-medium transition-colors"
          >
            New
          </button>
          <button onClick={() => handleRedirect("join")}
            className="px-4 py-2 bg-[#4F545C] hover:bg-[#5865F2] text-white rounded-md font-medium transition-colors"
          >
            Join
          </button>
          <button
            onClick={RefreshTokens}
            className="mt-4 p-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition text-white text-sm"
          >
            Refresh Tokens
          </button>
        </div>
      </div>

      {/* Middle Panel */}
      <div className="bg-[#2F3136] p-4 overflow-y-auto border-r border-[#202225]">
        {mode === "user" ? (
          <>
            <h2 className="text-gray-400 text-sm font-semibold mb-3">Users</h2>
            <ul className="flex flex-col gap-2">
              {userList.map((user) => {
                if (user.username !== activeUser.username)
                  return (
                    <li
                      key={user.id}
                      className="cursor-pointer p-2 rounded hover:bg-[#3A3C43] transition"
                      onClick={() => handleReceiverChange(user)}
                    >
                      {user.username}
                    </li>
                  );
              })}
            </ul>
          </>
        ) : (
          <>
            <h2 className="text-gray-400 text-sm font-semibold mb-3">Servers</h2>
            <div className="flex flex-col gap-2">
              {serverList.map((server) => (
                <div
                  key={server.id}
                  className="p-2 rounded hover:bg-[#3A3C43] transition cursor-pointer text-white"
                  onClick={() => handleServerChange(server)}
                >
                  {server.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-y-auto bg-[#36393F]">
        {mode === "user" && <DM setUserList={setUserList} receiver={activeReceiver} DMs={DMs} activeUser={activeUser} socket={socket} />}
        {mode === "server" && <Server setServerList={setServerList} name={activeServer} activeServer={activeServer} socket={socket} serverMessages={serverMessages} setServerMessages={setServerMessages} activeUser={activeUser.username} />}
        {mode === "create" && <CreateServer owner={activeUser.username} socket={socket} />}
        {mode === "join" && <JoinServer serverList={serverList} activeUser={activeUser.username} socket={socket} />}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
