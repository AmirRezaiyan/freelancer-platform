import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import { AuthContext } from "./context/auth-context";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const ProjectCreate = lazy(() => import("./pages/ProjectCreate"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const ProjectEdit = lazy(() => import("./pages/ProjectEdit"));
const Proposals = lazy(() => import("./pages/Proposals"));

function RequireAuth({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  const location = useLocation();
  if (loading) return <div className="app-loading" role="status">در حال بررسی حساب کاربری...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="app-loading" role="status">در حال بارگذاری...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
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
              <Route path="projects" element={<Projects />} />
              <Route path="projects/create" element={<ProjectCreate />} />
              <Route path="projects/:id/edit" element={<ProjectEdit />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="proposals" element={<Proposals />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
