import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Layout";
import { useEffect, useState } from "react";
import type { DMMessage, DMMessageFromServer } from "./types";

const App = () => {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [DMs, setDMs] = useState<DMMessage[]>([]);

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
        }
        setSocket(tempSocket);
    }, [])

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<Layout socket={socket} DMs={DMs} setDMs={setDMs} />}>
                <Route index/>
                <Route path="/dms/:user" element={"dummy"} />
            </Route>
        )
    )

    return <>
        <RouterProvider router={router}/>
    </>
}

export default App;
