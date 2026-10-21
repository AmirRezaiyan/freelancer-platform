import assert from "node:assert/strict";
import test from "node:test";
import { publicProjectResults, publicProjectState } from "../src/utils/landingData.js";

test("public project preview normalizes array and paginated responses", () => {
  assert.deepEqual(publicProjectResults([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(publicProjectResults({ results: [{ id: 2 }] }), [{ id: 2 }]);
  assert.deepEqual(publicProjectResults({ results: null }), []);
});

test("public project preview distinguishes loading, error, empty, and results", () => {
  assert.equal(publicProjectState({ loading: true, error: null, projects: [] }), "loading");
  assert.equal(publicProjectState({ loading: false, error: "failed", projects: [] }), "error");
  assert.equal(publicProjectState({ loading: false, error: null, projects: [] }), "empty");
  assert.equal(publicProjectState({ loading: false, error: null, projects: [{ id: 1 }] }), "success");
});