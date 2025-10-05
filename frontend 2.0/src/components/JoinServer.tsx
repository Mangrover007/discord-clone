import { useEffect, useState } from "react";
import type { Server } from "../types";

type JoinServerProps = {
  serverList: Server[],
  activeUser: string,
  socket: WebSocket | null
}

const JoinServer = ({ activeUser, socket }: JoinServerProps) => {

  const [allServers, setAllServers] = useState<Server[]>([]);

  async function getAllServers() {
    const res = await fetch("http://localhost:3000/server/all", {
      credentials: "include"
    })
    const data = await res.json()
    console.log(data);
    setAllServers(data);
  }

  useEffect(() => {
    getAllServers();
  }, [])

  const handleServerJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = e.target as HTMLButtonElement;
    const payload = {
      type: "server-join",
      username: activeUser,
      serverName: button.name
    }
    socket?.send(JSON.stringify(payload));
    console.log("joining server or what now?", button.name)
  }

  return <>
    <h1>Join a server</h1>
    Select a server and click join to join it
    {allServers.map(server => {
      return <div>
        {server.name}
        <button onClick={e => handleServerJoin(e)} name={server.name}>Join</button>
      </div>
    })}
  </>
}

export { JoinServer };
