import api from "./axios";

const UsersAPI = {
  profile: async (userId) => {
    const res = await api.get(`/users/${userId}/`);
    return res.data;
  },

  updateProfile: async (userId, data) => {
    const res = await api.put(`/users/${userId}/`, data);
    return res.data;
  },

  freelancers: async () => {
    const res = await api.get("/users/freelancers/");
    return res.data;
  },

  clients: async () => {
    const res = await api.get("/users/clients/");
    return res.data;
  },
};

export default UsersAPI;
