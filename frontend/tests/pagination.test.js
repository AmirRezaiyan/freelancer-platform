import assert from "node:assert/strict";
import test from "node:test";
import { collectPaginatedResults, mergeUniqueRecords } from "../src/utils/collectPaginatedResults.js";

test("merges paginated records without repeating IDs", () => {
  assert.deepEqual(
    mergeUniqueRecords([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }]),
    [{ id: 1 }, { id: 2 }, { id: 3 }],
  );
});

test("collects every page and removes duplicate project records", async () => {
  const requests = [];
  const result = await collectPaginatedResults(async (page) => {
    requests.push(page);
    return page === 1
      ? { data: { count: 3, next: "?page=2", results: [{ id: 1 }, { id: 2 }] } }
      : { data: { count: 3, next: null, results: [{ id: 2 }, { id: 3 }] } };
  });

  assert.deepEqual(requests, [1, 2]);
  assert.deepEqual(result, [{ id: 1 }, { id: 2 }, { id: 3 }]);
});

test("returns an empty paginated collection", async () => {
  const result = await collectPaginatedResults(async () => ({
    data: { count: 0, next: null, results: [] },
  }));

  assert.deepEqual(result, []);
});

test("rejects missing or inconsistent pagination metadata", async () => {
  await assert.rejects(
    collectPaginatedResults(async () => ({ data: { results: [] } })),
    /invalid paginated response/,
  );
  await assert.rejects(
    collectPaginatedResults(async () => ({ data: { count: 2, next: null, results: [{ id: 1 }] } })),
    /metadata ended/,
  );
});

test("propagates request failures and respects the page bound", async () => {
  const requestError = new Error("HTTP 503");
  await assert.rejects(
    collectPaginatedResults(async () => { throw requestError; }),
    requestError,
  );

  await assert.rejects(
    collectPaginatedResults(async () => ({
      data: { count: 2, next: "?page=2", results: [{ id: 1 }] },
    }), { maxPages: 1 }),
    /retrieval limit/,
  );
});

test("does not issue a request after cancellation", async () => {
  const controller = new AbortController();
  controller.abort();
  let requested = false;

  await assert.rejects(
    collectPaginatedResults(async () => {
      requested = true;
      return { data: { count: 0, next: null, results: [] } };
    }, { signal: controller.signal }),
    { name: "AbortError" },
  );
  assert.equal(requested, false);
});
