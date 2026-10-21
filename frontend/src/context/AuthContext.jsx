import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AuthAPI from "../api/auth";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const access = localStorage.getItem("access_token");
    if (!access) {
      setLoading(false);
      setUser(null);
      return;
    }
    try {
      const res = await api.get("/users/me/");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await AuthAPI.login(email, password); 
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const register = async (email, password, user_type) => {
    try {
      const data = await AuthAPI.register(email, password, user_type);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}
