export function mapDashboardMetrics(userType, response, proposalStats = {}) {
  const counts = response?.counts || {};
  const numberOrNull = (value) => value != null && Number.isFinite(Number(value)) ? Number(value) : null;

  if (userType === "client") {
    return {
      projectsTotal: numberOrNull(counts.projects_total),
      activeProjects: numberOrNull(counts.in_progress),
      proposalsReceived: numberOrNull(counts.proposals_received),
    };
  }

  if (userType === "freelancer") {
    return {
      proposalsSent: numberOrNull(counts.proposals_sent),
      pendingProposals: numberOrNull(proposalStats.pending),
      acceptedProposals: numberOrNull(proposalStats.accepted),
    };
  }

  return {};
}

export function pageResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

export function entityId(entity) {
  if (entity && typeof entity === "object") return entity.id ?? entity.pk ?? null;
  return entity ?? null;
}