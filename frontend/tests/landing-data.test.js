import assert from "node:assert/strict";
import test from "node:test";
import { featuredPublicProjects, publicProjectResults, publicProjectState } from "../src/utils/landingData.js";

test("public project preview normalizes array and paginated responses", () => {
  assert.deepEqual(publicProjectResults([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(publicProjectResults({ results: [{ id: 2 }] }), [{ id: 2 }]);
  assert.deepEqual(publicProjectResults({ results: null }), []);
});

test("public project preview preserves the first three real projects at most", () => {
  const projects = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }));
  assert.deepEqual(featuredPublicProjects(projects), projects.slice(0, 3));
  assert.deepEqual(featuredPublicProjects(projects.slice(0, 2)), projects.slice(0, 2));
  assert.deepEqual(featuredPublicProjects(projects.slice(0, 1)), projects.slice(0, 1));
  assert.deepEqual(featuredPublicProjects([]), []);
});

test("public project preview distinguishes loading, error, empty, and results", () => {
  assert.equal(publicProjectState({ loading: true, error: null, projects: [] }), "loading");
  assert.equal(publicProjectState({ loading: false, error: "failed", projects: [] }), "error");
  assert.equal(publicProjectState({ loading: false, error: null, projects: [] }), "empty");
  assert.equal(publicProjectState({ loading: false, error: null, projects: [{ id: 1 }] }), "success");
});