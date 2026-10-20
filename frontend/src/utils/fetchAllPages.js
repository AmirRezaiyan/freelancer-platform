import api from "../api/axios";

export default async function fetchAllPages(url, params = {}) {
  const results = [];
  let page = 1;

  while (true) {
    const response = await api.get(url, { params: { ...params, page, page_size: 50 } });
    const data = response.data;
    if (Array.isArray(data)) return results.concat(data);

    results.push(...(data?.results || []));
    if (!data?.next) return results;
    page += 1;
  }
}
