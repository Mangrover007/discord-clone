import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Layout";
import { createContext, useEffect, useRef, useState } from "react";
import type { DMPayload } from "./types/server-types";
import type { DMMessage, User, Server, ServerMessage } from "./types/client-types";

type PortalContextType = {
  socket: WebSocket | null,
  userDMs: DMMessage[],
  setUserDMs: React.Dispatch<React.SetStateAction<DMMessage[]>>,
  setActiveReceiver: React.Dispatch<React.SetStateAction<User>>,
  triggerScrollToBottom: boolean
}

export const Portal = createContext<PortalContextType | null>(null);

const App = () => {

  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  const [userDMs, setUserDMs] = useState<DMMessage[]>([]);

  const [serverList, setServerList] = useState<Server[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [serverMessages, setServerMessages] = useState<ServerMessage[]>([]);
  const [activeServer, setActiveServer] = useState("");
  const [activeReceiver, setActiveReceiver] = useState<User>({ id: "", username: "" });
  const [triggerScrollToBottom, setTriggerScrollToBottom] = useState<boolean>(false);
  const activeServerRef = useRef<string | null>(null);
  const activeReceiverRef = useRef<User>({ id: "", username: "" });

  // context values
  const value = {
    socket: socket,
    userDMs: userDMs,
    setUserDMs: setUserDMs,
    setActiveReceiver: setActiveReceiver,
    triggerScrollToBottom: triggerScrollToBottom
  }

  useEffect(() => {
    activeServerRef.current = activeServer
  }, [activeServer])

  useEffect(() => {
    activeReceiverRef.current = activeReceiver
  }, [activeReceiver])

  useEffect(() => {
    const tempSocket = new WebSocket("ws://localhost:3000/ws");
    tempSocket.onopen = () => console.log("New socket connection opened");
    tempSocket.onclose = () => console.log("Socket connection closed");
    tempSocket.onmessage = (message) => {
      const payload = JSON.parse(message.data);
      console.log(payload)
      if (payload.type === "dm") {
        console.log("active receiver - ", activeReceiverRef.current)
        const DMPayload: DMPayload = {
          data: {
            content: payload.content,
            createdAt: payload.createdAt,
            id: payload.id,
            receiver: payload.receiver,
            sender: payload.sender
          },
          type: "dm"
        };
        const clientDM: DMMessage = {
          content: DMPayload.data.content,
          receiver: DMPayload.data.receiver.username,
          sender: DMPayload.data.sender.username
        }
        console.log("client dm - ", clientDM);
        if (activeReceiverRef.current.username === clientDM.receiver || activeReceiverRef.current.username === clientDM.sender) {
          // scroll to bottom
          console.log("scroll to bottom");
          setUserDMs(prev => [clientDM, ...prev]);
          setTriggerScrollToBottom(prev => !prev);
        }
      }
    }
    setSocket(tempSocket);
  }, [])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout
        userList={userList}
        serverList={serverList}
        setActiveServer={setActiveServer}
        setUserList={setUserList}
        activeServer={activeServer}
        serverMessages={serverMessages}
        setServerList={setServerList}
        setServerMessages={setServerMessages}
        activeReceiver={activeReceiver}
        setActiveReceiver={setActiveReceiver}
      />}>
        {/* <Route index /> */}
        {/* <Route path="/dms/:user" element={"dummy"} /> */}
      </Route>
    )
  )

  return <>
    <Portal.Provider value={value}>
      <RouterProvider router={router} />
    </Portal.Provider>
  </>
}

export default App;
