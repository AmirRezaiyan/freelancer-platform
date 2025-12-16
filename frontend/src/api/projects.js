import api from "./axios";

const ProjectsAPI = {
  list: async () => {
    const res = await api.get("/projects/");
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/projects/", data);
    return res.data;
  },

  retrieve: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/`);
    return res.data;
  },

  update: async (projectId, data) => {
    const res = await api.put(`/projects/${projectId}/`, data);
    return res.data;
  },

  delete: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}/`);
    return res.data;
  },
};

export default ProjectsAPI;
