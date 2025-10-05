import React, { createContext, useState, useEffect, useContext } from "react";

export type User = {
    id: string;
    username: string;
} | null;

export type Server = {
    id: string;
    name: string;
};

type AuthContextType = {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    loading: boolean;
    servers: Server[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<Server[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Refresh token
                const res = await fetch("http://localhost:3000/auth/refresh-token", {
                    credentials: "include",
                });

                if (res.ok) {
                    const userData = await res.json().catch(() => null);
                    if (!userData?.username) {
                        const me = await fetch("http://localhost:3000/auth/me", {
                            credentials: "include",
                        }).then((r) => (r.ok ? r.json() : null));
                        if (me) setUser(me);
                    } else {
                        setUser(userData);
                    }
                } else {
                    setUser(null);
                }

                // Fetch servers
                const srvRes = await fetch("http://localhost:3000/servers", {
                    credentials: "include",
                });
                if (srvRes.ok) {
                    const srvData: Server[] = await srvRes.json();
                    setServers(srvData);
                }
            } catch (err) {
                console.error("Auth or server fetch failed:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, servers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
    return ctx;
};
