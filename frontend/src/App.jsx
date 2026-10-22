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

function RequireRole({ role, children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="app-loading" role="status">در حال بررسی حساب کاربری...</div>;
  return user?.user_type === role ? children : <Navigate to="/dashboard" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="app-loading" role="status">در حال بررسی حساب کاربری...</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function FallbackRoute() {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="app-loading" role="status">در حال بررسی حساب کاربری...</div>;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="app-loading" role="status">در حال بارگذاری...</div>}>
          <Routes>
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            >
              <Route path="projects" element={<Projects />} />
              <Route path="projects/create" element={<RequireRole role="client"><ProjectCreate /></RequireRole>} />
              <Route path="projects/:id/edit" element={<RequireRole role="client"><ProjectEdit /></RequireRole>} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="proposals" element={<RequireRole role="freelancer"><Proposals /></RequireRole>} />
            </Route>

            <Route path="*" element={<FallbackRoute />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
