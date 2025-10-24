import React from "react";
import { useMessages } from "../hooks/useMessages";

type DMProps = {
    receiver: string; // username of the person you're chatting with
    currentUser: string; // username of logged-in user
};

const DM: React.FC<DMProps> = ({ receiver, currentUser }) => {
    // Use the hook for DMs
    const {
        messages,
        newMessage,
        setNewMessage,
        sendMessage,
        loading,
        messagesEndRef,
    } = useMessages({
        type: "dm",
        target: receiver,
        currentUser,
    });

    if (loading) return <div className="text-white p-4">Loading messages...</div>;

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
                Direct Message with @{receiver}
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

export { DM };
