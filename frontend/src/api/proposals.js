import api from "./axios";
import { buildProposalPayload } from "../utils/proposalPayload";

const ProposalsAPI = {
  create: async (projectId, bidAmount, message) => {
    const res = await api.post("/market/proposals/", buildProposalPayload(projectId, bidAmount, message));

    return res.data;
  },

  listByProject: async (projectId) => {
    const res = await api.get(`/market/projects/${projectId}/proposals/`);
    return res.data;
  },
};

export default ProposalsAPI;
