import { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DM } from "../components/DM";
import { LeftSidebar } from "../components/LeftSidebar"
import { MiddlePanel } from "../components/MiddlePanel"

import type { User, Server as ServerType } from "../types/client-types";
import type { } from "../types/server-types";

import { Portal } from "../App";
import { Server } from "../components/Server";
import { CreateServer } from "../components/CreateServer";
import { JoinServer } from "../components/JoinServer";
import { Login } from "../components/Login";
import { Register } from "../components/Register";

type LayoutProps = {
  userList: User[],
  setUserList: React.Dispatch<React.SetStateAction<User[]>>,

  serverList: ServerType[],
  setServerList: React.Dispatch<React.SetStateAction<ServerType[]>>,

  activeServer: ServerType | null,
  setActiveServer: React.Dispatch<React.SetStateAction<ServerType | null>>,

  activeReceiver: User,
  setActiveReceiver: React.Dispatch<React.SetStateAction<User>>,

  loggedIn: boolean,
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}

const Layout = ({
  userList, 
  serverList, 
  setActiveServer,
  setUserList, 
  setServerList, 
  activeServer,
  activeReceiver, 
  setActiveReceiver,
  loggedIn,
  setLoggedIn
}: LayoutProps) => {

  const [activeUser, setActiveUser] = useState<User>({ id: "", username: "" });

  const [mode, setMode] = useState<"user" | "server" | "create" | "join" | "login" | "register">("user");

  const context = useContext(Portal);
  const socket = context?.socket;



  useEffect(() => {
    if (context)
      context.activeUserRef.current = activeUser
  }, [activeUser]);

  async function getUser() {
    const res = await fetch("http://localhost:3000/auth/who", {
      credentials: "include",
      method: "GET",
    });
    if (res.status === 200) {
      setLoggedIn(true);
      const data: { id: string; username: string } = await res.json();
      setActiveUser(data);
    }
    else {
      // if res message says no token, try hitting /refresh-token ->
      // if /refresh-token successful, hit /who again ->
      // if /who status == 200, set loggedIn = true
      // otherwise prompt user to log in again
    }
  }

  useEffect(() => {
    async function getInfo() {
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
    }
    getInfo()
  }, [loggedIn])

  useEffect(() => {
    getUser()

    async function refreshLogin() {
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

    const interval = setInterval(() => {
      refreshLogin()
    }, 1000*60*10); // refresh login every 10 minutes

    return () => clearInterval(interval)
  }, [loggedIn]);

  return (
    <div className={`grid ${(mode === "login" || mode === "register") ? "grid-cols-[100px_1fr]" : "grid-cols-[100px_280px_1fr]"} h-screen bg-[#36393F] text-white`}>
      <LeftSidebar mode={mode} setActiveUser={setActiveUser} setMode={setMode} />

      { (mode === "login" || mode === "register") ? "" :
        <MiddlePanel
        activeUser={activeUser}
        mode={mode}
        serverList={serverList}
        setActiveReceiver={setActiveReceiver}
        setActiveServer={setActiveServer}
        userList={userList}
      />}

      {/* Main Content */}
      <div className="p-4 overflow-y-auto bg-[#36393F]">
        {mode === "user" && <DM setUserList={setUserList} activeUser={activeUser} socket={socket} activeReceiver={activeReceiver} />}
        {mode === "server" && <Server activeServer={activeServer} socket={socket} activeUser={activeUser} />}
        {mode === "create" && <CreateServer owner={activeUser} socket={socket} />}
        {mode === "join" && <JoinServer serverList={serverList} activeUser={activeUser} socket={socket} />}
        {mode === "login" && <Login setLoggedIn={setLoggedIn} />}
        {mode === "register" && <Register />}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
