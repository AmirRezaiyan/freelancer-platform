import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  loading: true,
  profileRefreshing: false,
  profileError: null,
  refreshUser: async () => null,
  logout: () => {},
  setUser: () => {},
  login: async () => {},
  register: async () => {},
});
