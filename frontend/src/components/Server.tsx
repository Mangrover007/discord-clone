import React from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../context/AuthContext";

const Server: React.FC = () => {
    const { serverName } = useParams<{ serverName: string }>();
    const { user } = useAuth();

    const currentUser = user?.username ?? "You";

    const {
        messages,
        newMessage,
        setNewMessage,
        sendMessage,
        loading,
        messagesEndRef,
    } = useMessages({
        type: "server",
        target: serverName ?? "",
        currentUser,
    });

    if (!serverName) return <div className="text-white p-4">Invalid server</div>;
    if (loading) return <div className="text-white p-4">Loading messages...</div>;

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
                Server: #{serverName}
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.sender === currentUser ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`px-3 py-2 rounded-xl max-w-xs ${msg.sender === currentUser
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-100"
                                }`}
                        >
                            <span className="block text-sm font-semibold">{msg.sender}</span>
                            <span>{msg.content}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 outline-none"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium text-black"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export { Server };
