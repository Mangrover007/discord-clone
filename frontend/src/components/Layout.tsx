import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth, type Server } from "../context/AuthContext";

type Mode = "dm" | "server";

const Layout: React.FC = () => {
    const { user, servers } = useAuth();
    const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
    const [mode, setMode] = useState<Mode>("dm");
    const navigate = useNavigate();
    const { username: activeChat } = useParams();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) return;
            try {
                const res = await fetch("http://localhost:3000/users", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("failed to fetch users");
                const data = await res.json();
                setUsers(data.filter((u: { id: string; username: string }) => u.username !== user.username));
            } catch (e) {
                console.error("Error fetching users:", e);
            }
        };

        fetchUsers();
    }, [user]);

    return (
        <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden">
            {/* Sidebar 1: Mode selector (DMs / Servers) */}
            <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-4 shrink-0">
                <SidebarIcon
                    label="DMs"
                    active={mode === "dm"}
                    onClick={() => setMode("dm")}
                />
                <SidebarIcon
                    label="Servers"
                    active={mode === "server"}
                    onClick={() => setMode("server")}
                />
            </div>

            {/* Sidebar 2: List of DMs or Servers */}
            <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
                <div className="p-4 text-xl font-bold border-b border-gray-800">
                    {mode === "dm" ? "Direct Messages" : "Servers"}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {mode === "dm" ? (
                        <ul>
                            {users.map((u) => (
                                <li
                                    key={u.id}
                                    onClick={() => navigate(`/dm/${u.username}`)}
                                    className={`p-3 cursor-pointer rounded-lg mx-2 my-1 ${activeChat === u.username
                                        ? "bg-blue-700"
                                        : "hover:bg-gray-800"
                                        }`}
                                >
                                    @{u.username}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul>
                            {servers.map((s: Server) => (
                                <li
                                    key={s.id}
                                    onClick={() => navigate(`/server/${s.name.toLowerCase()}`)}
                                    className="p-3 cursor-pointer rounded-lg mx-2 my-1 hover:bg-gray-800"
                                >
                                    {s.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
                    Logged in as{" "}
                    <span className="text-gray-200">@{user?.username}</span>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
};

// Reusable circle-like icon for sidebar
const SidebarIcon = ({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors text-black ${active
            ? "bg-blue-600"
            : "bg-gray-800 hover:bg-gray-700"
            }`}
        title={label}
    >
        {label}
    </button>
);

export { Layout };
