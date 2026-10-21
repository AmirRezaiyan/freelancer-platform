import api from "./axios";

const ProjectsAPI = {
  list: async () => {
    const res = await api.get("/market/projects/");
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/market/projects/", data);
    return res.data;
  },

  retrieve: async (projectId) => {
    const res = await api.get(`/market/projects/${projectId}/`);
    return res.data;
  },

  update: async (projectId, data) => {
    const res = await api.put(`/market/projects/${projectId}/`, data);
    return res.data;
  },

  delete: async (projectId) => {
    const res = await api.delete(`/market/projects/${projectId}/`);
    return res.data;
  },
};

export default ProjectsAPI;
