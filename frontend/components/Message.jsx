import { useState } from "react";

const Message = ({socket}) => {
    const [messageError, setMessageError] = useState("");
    const [message, setMessage] = useState("");

    const handleMessageSend = (e) => {
        e.preventDefault();
        if (!socket) {
            setMessageError("try logging in and connecting to the web socket dumbass");
            return;
        }
        setMessageError("");
        socket.send(JSON.stringify({
            text: message
        }));
        setMessage("");
    }

    return <>
        <p>{messageError}</p>
        <form action="" onSubmit={e => handleMessageSend(e)} style={{ border: "2px solid black", padding: "10px" }}>
            <input type="text" placeholder="write message" value={message} onChange={e => setMessage(e.target.value)} />
            <button>send</button>
        </form>
    </>
}

export { Message };
