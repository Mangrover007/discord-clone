// src/hooks/useMessages.ts
import { useEffect, useState, useRef } from "react";

export type Message = {
    id?: string;
    type: "dm" | "server";
    sender: string;
    content: string;
    receiver?: string; // for DMs
    server?: string; // for server messages
};

type UseMessagesProps = {
    type: "dm" | "server";
    target: string; // username for DM, serverName for server
    currentUser: string; // logged-in username
};

export const useMessages = ({ type, target, currentUser }: UseMessagesProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Fetch old messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const endpoint =
                    type === "dm"
                        ? `/dms/${target}`
                        : `/server-messages/${target}`;
                const res = await fetch(`http://localhost:3000${endpoint}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch messages");

                const data = await res.json();

                // Normalize data
                const formatted = data.map((msg: any) => ({
                    id: msg.id,
                    type,
                    content: msg.content,
                    sender: type === "dm" ? msg.username : msg.senderUsername,
                    ...(type === "dm" ? { receiver: msg.receiverUsername } : { server: target }),
                }));

                setMessages(formatted);
            } catch (e) {
                console.error("Error fetching messages:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [target, type]);

    // Connect WebSocket
    useEffect(() => {
        if (!target) return;

        const ws = new WebSocket("ws://localhost:3000/ws");
        wsRef.current = ws;

        ws.onopen = () => console.log(`Connected to ${type} ${target} ✅`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (
                (type === "dm" && data.type === "dm" &&
                    (data.sender === target || data.receiver === target)) ||
                (type === "server" && data.type === "server" && data.server === target)
            ) {
                setMessages((prev) => [
                    ...prev,
                    {
                        type,
                        sender: data.sender,
                        content: data.message,
                        ...(type === "dm" ? { receiver: data.receiver } : { server: data.server }),
                    },
                ]);
            }
        };

        ws.onclose = () => console.log(`WebSocket closed for ${type} ${target} ❌`);

        return () => ws.close();
    }, [target, type]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message
    const sendMessage = () => {
        if (!newMessage.trim() || !wsRef.current || !target) return;

        const payload =
            type === "dm"
                ? { type: "dm", receiver: target, content: newMessage.trim() }
                : { type: "server", server: target, content: newMessage.trim() };

        wsRef.current.send(JSON.stringify(payload));

        // Optimistic render uses currentUser as sender (not "You")
        setMessages((prev) => [
            ...prev,
            {
                type,
                sender: currentUser,
                content: newMessage.trim(),
                ...(type === "dm" ? { receiver: target } : { server: target }),
            },
        ]);

        setNewMessage("");
    };

    return {
        messages,
        newMessage,
        setNewMessage,
        sendMessage,
        loading,
        messagesEndRef,
    };
};
