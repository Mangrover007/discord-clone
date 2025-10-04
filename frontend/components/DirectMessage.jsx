import { useState } from "react";

const DirectMessage = ({socket}) => {
    const [messageError, setMessageError] = useState("");
    const [message, setMessage] = useState("");
    const [receiver, setReceiever] = useState("");

    const handleMessageSend = (e) => {
        e.preventDefault();
        console.log(new Date(Date.now()).toISOString())
        if (!socket) {
            setMessageError("try logging in and connecting to the web socket dumbass");
            return;
        }
        setMessageError("");
        const payload = {
            type: "dm",
            message: message,
            to: receiver
        }
        console.log(payload);
        socket.send(JSON.stringify(payload));
    }

    return <>
        <p>{messageError}</p>
        <form action="" onSubmit={e => handleMessageSend(e)} style={{ border: "2px solid black", padding: "10px" }}>
            <input type="text" placeholder="write message" value={message} onChange={e => setMessage(e.target.value)} />
            <button>send</button>
            <div>
                <p>to</p>
                <input type="text" placeholder="username" value={receiver} onChange={e => setReceiever(e.target.value)} />
            </div>
        </form>
    </>
}

export { DirectMessage };
