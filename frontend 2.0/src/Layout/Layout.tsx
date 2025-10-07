import { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DM } from "../components/DM";
import { LeftSidebar } from "../components/LeftSidebar"
import { MiddlePanel } from "../components/MiddlePanel"

import type { User, Server as ServerType, ServerMessage } from "../types/client-types";
import type { } from "../types/server-types";

import { Portal } from "../App";
import { Server } from "../components/Server";
import { CreateServer } from "../components/CreateServer";
import { JoinServer } from "../components/JoinServer";

type LayoutProps = {
  userList: User[],
  setUserList: React.Dispatch<React.SetStateAction<User[]>>,

  serverList: ServerType[],
  setServerList: React.Dispatch<React.SetStateAction<ServerType[]>>,

  activeServer: ServerType | null,
  setActiveServer: React.Dispatch<React.SetStateAction<ServerType | null>>,

  serverMessages: ServerMessage[],
  setServerMessages: React.Dispatch<React.SetStateAction<ServerMessage[]>>,

  activeReceiver: User,
  setActiveReceiver: React.Dispatch<React.SetStateAction<User>>
}

const Layout = ({
  userList, 
  serverList, 
  setActiveServer,
  setUserList, 
  setServerList, 
  activeServer, 
  serverMessages, 
  setServerMessages, 
  activeReceiver, 
  setActiveReceiver
}: LayoutProps) => {

  const [activeUser, setActiveUser] = useState<{ id: string; username: string }>({ id: "", username: "" });

  const [mode, setMode] = useState<"user" | "server" | "create" | "join">("user");

  const context = useContext(Portal);
  const socket = context?.socket;

  useEffect(() => {
    if (context)
      context.activeUserRef.current = activeUser
  }, [activeUser]);

  async function getInfo() {
    const res = await fetch("http://localhost:3000/auth/who", {
      credentials: "include",
      method: "GET",
    });
    const data: { id: string; username: string } = await res.json();
    const userList = await fetch("http://localhost:3000/users", {
      credentials: "include",
      method: "GET"
    })
    const userListList = await userList.json()
    const serverList = await fetch("http://localhost:3000/server", {
      credentials: "include",
      method: "GET"
    })
    const serverListList = await serverList.json()
    setUserList(userListList)
    setServerList(serverListList)
    setActiveUser(data);
    console.log("set up is done - try clicking user")
  }

  useEffect(() => {
    getInfo()
  }, []);

  return (
    <div className="grid grid-cols-[100px_280px_1fr] h-screen bg-[#36393F] text-white">
      <LeftSidebar mode={mode} setActiveUser={setActiveUser} setMode={setMode} />

      <MiddlePanel
        activeUser={activeUser}
        mode={mode}
        serverList={serverList}
        setActiveReceiver={setActiveReceiver}
        setActiveServer={setActiveServer}
        userList={userList}
      />

      {/* Main Content */}
      <div className="p-4 overflow-y-auto bg-[#36393F]">
        {mode === "user" && <DM setUserList={setUserList} activeUser={activeUser} socket={socket} activeReceiver={activeReceiver} />}
        {mode === "server" && <Server activeServer={activeServer} socket={socket} serverMessages={serverMessages} setServerMessages={setServerMessages} activeUser={activeUser} />}
        {mode === "create" && <CreateServer owner={activeUser} socket={socket} />}
        {mode === "join" && <JoinServer serverList={serverList} activeUser={activeUser} socket={socket} />}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
