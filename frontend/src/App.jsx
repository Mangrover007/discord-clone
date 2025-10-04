import { useState } from "react";

import "./App.css";
import { Register } from "../components/Register";

const App = () => {

    const [chat, setChat] = useState([])
    const [receiver, setReceiver] = useState("")
    const [dms, setDms] = useState([]);
    
    const getDms = async () => {
        if (!receiver) {
            return
        }
        try {
            const res = await fetch(`http://localhost:3000/dms/${receiver}`, {
                method: "GET",
                credentials: "include"
            });
            if (res.status === 200) {
                const data = await res.json()
                setDms(data);
            }
        }
        catch (e) {
            console.log("dm error", e);
        }
    }

    return <main className="stuff">
        <Register chat={chat} setChat={setChat} />
        <div className="chatBox">
            <h1>Chat</h1>
            {chat.map(ch => {
                console.log(ch)
                return <p>{ch.username}: {ch.message}</p>
            })}
        </div>
        <div>
            <h1>DMs</h1>
            Receiver - <input type="text" placeholder="username" value={receiver} onChange={e => setReceiver(e.target.value)} />
            <button onClick={getDms}>open</button>
            <div>
                {dms.map(dm => {
                    console.log(dm)
                    const { senderUsername, content } = dm;
                    return <p>
                        {senderUsername}: {content}
                    </p>
                })}
            </div>
        </div>
    </main>
}

export default App;
