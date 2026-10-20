import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  config.withCredentials = false;
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return Promise.reject(error);

      try {
        const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refresh,
        });

        localStorage.setItem("access_token", res.data.access);
        if (res.data.refresh) {
          localStorage.setItem("refresh_token", res.data.refresh);
        }
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
