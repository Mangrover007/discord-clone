import React from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DM } from "./components/DM";
import { Server } from "./components/Server";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ Wrapper to inject receiver param
// ✅ Wrapper to inject receiver param
const DMPage: React.FC = () => {
  const { username } = useParams();
  const { user } = useAuth();
  if (!user) return <div className="text-white p-4">Please log in again.</div>;

  // Add key to force remount on username change
  return <DM key={username} receiver={username ?? ""} currentUser={user.username} />;
};


// ✅ Wrapper to inject serverName param
const ServerPage: React.FC = () => {
  const { serverName } = useParams();
  if (!serverName) return <div className="text-white p-4">Invalid server</div>;

  // Add key to force remount on serverName change
  return <Server key={serverName} />;
};


// ✅ Protect routes from unauthenticated access
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!user) return <div className="text-white p-4">Please log in again.</div>;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/dm/:username"
              element={
                <ProtectedRoute>
                  <DMPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/server/:serverName"
              element={
                <ProtectedRoute>
                  <ServerPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
