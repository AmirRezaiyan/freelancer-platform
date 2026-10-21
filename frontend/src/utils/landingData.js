export function publicProjectResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

export function publicProjectState({ loading, error, projects }) {
  if (loading) return "loading";
  if (error) return "error";
  return projects?.length ? "success" : "empty";
}