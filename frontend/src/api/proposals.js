import api from "./axios";

const ProposalsAPI = {
  create: async (projectId, price, message) => {
    const res = await api.post("/market/proposals/", {
      project: projectId,
      price,
      message,
    });

    return res.data;
  },

  listByProject: async (projectId) => {
    const res = await api.get(`/market/projects/${projectId}/proposals/`);
    return res.data;
  },
};

export default ProposalsAPI;
