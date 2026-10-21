export async function collectPaginatedResults(fetchPage, { maxPages = 100, signal } = {}) {
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new RangeError("maxPages must be a positive integer.");
  }

  const results = [];
  const seen = new Set();

  for (let page = 1; page <= maxPages; page += 1) {
    if (signal?.aborted) {
      const error = new Error("Pagination was cancelled.");
      error.name = "AbortError";
      throw error;
    }

    const response = await fetchPage(page, signal);
    const data = response?.data;
    if (Array.isArray(data)) {
      appendUnique(results, seen, data);
      return results;
    }
    if (
      !data
      || !Array.isArray(data.results)
      || !Number.isInteger(data.count)
      || data.count < 0
      || (data.next !== null && typeof data.next !== "string")
    ) {
      throw new Error("The API returned an invalid paginated response.");
    }

    appendUnique(results, seen, data.results);
    if (!data.next) {
      if (Number.isFinite(data.count) && data.count > results.length) {
        throw new Error("The API pagination metadata ended before all results were returned.");
      }
      return results;
    }
  }

  throw new Error(`The API result exceeds the ${maxPages}-page retrieval limit.`);
}

export function mergeUniqueRecords(existing, incoming) {
  const merged = [];
  const seen = new Set();
  appendUnique(merged, seen, existing);
  appendUnique(merged, seen, incoming);
  return merged;
}

function appendUnique(results, seen, items) {
  for (const item of items) {
    const key = item?.id ?? item?.project?.id ?? item?.project_id;
    if (key == null) {
      results.push(item);
    } else if (!seen.has(String(key))) {
      seen.add(String(key));
      results.push(item);
    }
  }
}
