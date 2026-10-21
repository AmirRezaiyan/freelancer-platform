import api from "../api/axios";
import { collectPaginatedResults } from "./collectPaginatedResults";

export default async function fetchAllPages(url, params = {}, { maxPages = 100, signal } = {}) {
  return collectPaginatedResults(
    (page, requestSignal) => api.get(url, {
      params: { ...params, page, page_size: 50 },
      signal: requestSignal,
    }),
    { maxPages, signal },
  );
}
