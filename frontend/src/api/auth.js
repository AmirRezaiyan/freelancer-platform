import api from "./axios";

const AuthAPI = {
  register: async (email, password, username, user_type) => {
    const res = await api.post("users/register/", {
      email,
      password,
      username,
      user_type,
    });
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post("users/login/", {
      email,
      password,
    });

    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);

    return res.data.user; 
  },

  me: async () => {
    const res = await api.get("me/");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export default AuthAPI;
