import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectCreate from "./pages/ProjectCreate";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProjectEdit from "./pages/ProjectEdit";
import Proposals from "./pages/Proposals";  

function RequireAuth({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div style={{ color: "#fff", padding: 40 }}>در حال چک کردن وضعیت کاربری...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LocationLogger() {
  const loc = useLocation();
  useEffect(() => {
    console.log("[ROUTE] location changed:", loc.pathname + loc.search + loc.hash);
  }, [loc]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationLogger />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard/*"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<ProjectCreate />} />
            <Route path="projects/:id/edit" element={<ProjectEdit />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="proposals" element={<Proposals />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
