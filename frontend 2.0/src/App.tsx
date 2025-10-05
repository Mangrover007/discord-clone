import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Layout";
import { useEffect, useRef, useState } from "react";
import type { DMMessage, DMMessageFromServer, User, Server as ServerType, ServerMessage } from "./types";

const App = () => {

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [DMs, setDMs] = useState<DMMessage[]>([]);
  const [serverList, setServerList] = useState<ServerType[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [serverMessages, setServerMessages] = useState<ServerMessage[]>([]);
  const [activeServer, setActiveServer] = useState("");
  const activeServerRef = useRef<string | null>(null);

  useEffect(() => {
    activeServerRef.current = activeServer
  }, [activeServer])

  useEffect(() => {
    const tempSocket = new WebSocket("ws://localhost:3000/ws");
    tempSocket.onopen = () => console.log("New socket connection opened");
    tempSocket.onclose = () => console.log("Socket connection closed");
    tempSocket.onmessage = (message) => {
      const payload = JSON.parse(message.data);
      console.log("THIS MESSAGE: ", payload);
      if (payload.type === "dm") {
        const clientDM: DMMessageFromServer = {
          content: payload.content,
          sender: payload.sender.username,
          receiver: payload.receiver.username,
          createdAt: payload.createdAt,
          id: payload.id
        }
        setDMs(prev => [...prev, clientDM]);
      }
      if (payload.type === "server-create") {
        const newServer = {
          id: payload.id,
          name: payload.name,
          // ownerId: payload.ownerId
        }
        setServerList(prev => [...prev, newServer]);
      }
      if (payload.type === "server") {
        const currentActiveServer = activeServerRef.current
        console.log(payload.server, " and this is active server - ", currentActiveServer)
        const newServerMessage: ServerMessage = {
          type: "server",
          content: payload.content,
          sender: payload.sender,
          server: payload.server
          // ownerId: payload.ownerId
        }
        if (newServerMessage.server === currentActiveServer) {
          setServerMessages(prev => [...prev, newServerMessage]);
        }
      }
    }
    setSocket(tempSocket);
  }, [])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout socket={socket} DMs={DMs} setDMs={setDMs} serverList={serverList} setServerList={setServerList} setUserList={setUserList} userList={userList} serverMessages={serverMessages} setServerMessages={setServerMessages} activeServer={activeServer} setActiveServer={setActiveServer} />}>
        <Route index />
        <Route path="/dms/:user" element={"dummy"} />
      </Route>
    )
  )

  return <>
    <RouterProvider router={router} />
  </>
}

export default App;
