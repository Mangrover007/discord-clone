import type React from "react";
import type { User, DMMessage } from "../types";
import { useEffect, useState, useRef } from "react";

type DMProps = {
    setUserList: React.Dispatch<React.SetStateAction<User[]>>,
    receiver: string,
    DMs: DMMessage[],
    activeUser: { id: string; username: string },
    socket: WebSocket | null
};

const DM = ({ setUserList, receiver, DMs, activeUser, socket }: DMProps) => {
    const [message, setMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function getUserList() {
            try {
                const res = await fetch("http://localhost:3000/users", {
                    credentials: "include"
                });
                const data: User[] = await res.json();
                setUserList(data);
            } catch (err) {
                console.error(err);
            }
        }

        getUserList();
    }, [setUserList]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        const payload = {
            type: "dm",
            receiver: receiver,
            content: message
        }
        console.log(payload)
        socket?.send(JSON.stringify(payload));
        setMessage("");
    };

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [DMs]);

    return (
        <div className="flex flex-col h-full bg-[#36393F] rounded-md overflow-hidden shadow-lg">
            <h1 className="text-white font-bold p-4 border-b border-[#2F3136]">DM with {receiver}</h1>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-[#2F3136]">
                {DMs.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === activeUser.username ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`p-2 rounded-lg max-w-xs break-words ${msg.sender === activeUser.username
                                    ? "bg-[#5865F2] text-white rounded-br-none"
                                    : "bg-[#4F545C] text-white rounded-bl-none"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex p-3 bg-[#40444B] border-t border-[#2F3136]">
                <input
                    type="text"
                    placeholder="Write a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-[#40444B] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                    onClick={handleSendMessage}
                    className="ml-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-md text-white font-medium transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export { DM };
