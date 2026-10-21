import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import { AuthContext } from "./context/auth-context";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const ProjectCreate = lazy(() => import("./pages/ProjectCreate"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const ProjectEdit = lazy(() => import("./pages/ProjectEdit"));
const Proposals = lazy(() => import("./pages/Proposals"));

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
        <Suspense fallback={<div role="status" style={{ color: "#fff", padding: 24 }}>در حال بارگذاری...</div>}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
