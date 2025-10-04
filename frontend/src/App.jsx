import { useState } from "react";

import "./App.css";

const App = () => {

    const [status, setStatus] = useState("Click to connect");
    const [socket, setSocket] = useState(null);
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loginData, setLoginData] = useState({
        username: "",
        password: ""
    });
    const [registerState, setRegisterState] = useState("");
    const [loginState, setloginState] = useState("");
    const [messageError, setMessageError] = useState("");
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([])

    const webSocketConnect = async () => {
        try {
            setStatus("Connecting...")
            const getSocket = new WebSocket("ws://localhost:3000/ws")
            getSocket.onerror = function (err) {
                console.log(err)
            }
            getSocket.onopen = function (event) {
                setStatus("Connected!");
                console.log(getSocket);
                setSocket(getSocket)
            }
            getSocket.onclose = function (event) {
                if (event.code === 1006) {
                    setStatus("Error occurred. Try logging in smartass.")
                }
                else {
                    setStatus("Click to connect");
                }
            }
            getSocket.onmessage = data => {
                const { username, message: mes } = JSON.parse(data.data);
                console.log("this what i received from web socket - ", username, mes);
                const chatMessage = {
                    username: username,
                    message: mes
                }
                setChat(prev => {
                    return [...prev, chatMessage]
                })
            }
        }
        catch (e) {
            console.log("Idk what error", e);
        }
    }

    const closeConnect = () => {
        if (socket)
            socket.close();
        setSocket(null);
    }

    const logSocket = () => {
        console.log(socket);
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerData)
            })
            if (res.status === 201) {
                setRegisterState("new user registered")
                console.log(res.body);
            }
        }
        catch (e) {
            console.log("register error", e)
        }
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData),
                credentials: "include"
            })
            if (res.status === 200) {
                setloginState("login successful")
                console.log(res.body);
            }
            else {
                setloginState("login failed youre ass")
                console.log(res.body)
            }
        }
        catch (e) {
            console.log("register error", e)
        }
    }

    const handleRegisterChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setRegisterData(prev => {
            return { ...prev, [key]: value }
        })
    }

    const handleLoginChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setLoginData(prev => {
            return { ...prev, [key]: value }
        })
    }

    const refreshToken = async () => {
        try {
            const res = await fetch("http://localhost:3000/refresh-token", {
                method: "GET",
                credentials: "include"
            })
            if (res.status === 200) {
                console.log("Token refreshed");
            }
            else {
                console.log("log in again something went wrong idk what");
            }
        }
        catch (e) {
            console.log("refresh token error", e)
        }
    }

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

    return <main className="stuff">
        <div>
            <section>
                <h1>Register</h1>
                <p>{registerState}</p>
                <form action="" onSubmit={e => handleRegisterSubmit(e)}>
                    <div>
                        <input type="text" placeholder="Username" name="username" value={registerData.username} onChange={e => handleRegisterChange(e)} />
                    </div>
                    <div>
                        <input type="text" placeholder="Email" name="email" value={registerData.email} onChange={e => handleRegisterChange(e)} />
                    </div>
                    <div>
                        <input type="text" placeholder="Password" name="password" value={registerData.password} onChange={e => handleRegisterChange(e)} />
                    </div>
                    <button>Submit</button>
                </form>
            </section>
            <section>
                <h1>Login</h1>
                <p>{loginState}</p>
                <form action="" onSubmit={e => handleLoginSubmit(e)}>
                    <div>
                        <input type="text" placeholder="Username" name="username" value={loginData.username} onChange={e => handleLoginChange(e)} />
                    </div>
                    <div>
                        <input type="text" placeholder="Password" name="password" value={loginData.password} onChange={e => handleLoginChange(e)} />
                    </div>
                    <button>Submit</button>
                </form>
            </section>
            <p>{status}</p>
            <button onClick={webSocketConnect}>Connect</button>
            <button onClick={closeConnect}>Disconnect</button>
            <button onClick={logSocket}>log socket</button>
            <button onClick={refreshToken}>refresh token</button>
            <p>{messageError}</p>
            <form action="" onSubmit={e => handleMessageSend(e)}>
                <input type="text" placeholder="write message" value={message} onChange={e => setMessage(e.target.value)} />
                <button>send</button>
            </form>
        </div>
        <div className="chatBox">
            <h1>Chat</h1>
            {chat.map(ch => {
                console.log(ch)
                return <p>{ch.username}: {ch.message}</p>
            })}
        </div>
    </main>
}

export default App;
