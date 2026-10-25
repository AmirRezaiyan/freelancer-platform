import React, { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import AuthAPI from "../api/auth";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileRefreshing, setProfileRefreshing] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setUser(null);
      setProfileError(null);
      setProfileRefreshing(false);
      return null;
    }

    setProfileRefreshing(true);
    try {
      const res = await api.get("/users/me/");
      setUser(res.data);
      setProfileError(null);
      return res.data;
    } catch (error) {
      setUser((current) => current ? { ...current, profile_completion: null } : current);
      setProfileError(error);
      return null;
    } finally {
      setProfileRefreshing(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setLoading(false);
      setUser(null);
      setProfileRefreshing(false);
      return;
    }
    await refreshUser();
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    try {
      const userData = await AuthAPI.login(email, password); 
      setUser(userData);
      const currentUser = await refreshUser();
      return { success: true, user: currentUser || userData };
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
    setProfileError(null);
    setProfileRefreshing(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileRefreshing, profileError, refreshUser, logout, setUser, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}
