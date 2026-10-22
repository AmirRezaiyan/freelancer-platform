import assert from "node:assert/strict";
import test from "node:test";
import { entityId, mapDashboardMetrics, pageResults } from "../src/utils/dashboardData.js";

test("client dashboard metrics use client counts from the API", () => {
  assert.deepEqual(mapDashboardMetrics("client", {
    counts: { projects_total: 4, in_progress: 2, proposals_received: 7 },
  }), {
    projectsTotal: 4,
    activeProjects: 2,
    proposalsReceived: 7,
  });
});

test("freelancer dashboard metrics use actual proposal statuses", () => {
  assert.deepEqual(mapDashboardMetrics("freelancer", {
    counts: { proposals_sent: 9, active_contracts: 1, earnings: 125000 },
  }, { pending: 4, accepted: 1 }), {
    proposalsSent: 9,
    pendingProposals: 4,
    acceptedProposals: 1,
  });
});

test("dashboard response helpers handle paginated and related entity shapes", () => {
  assert.deepEqual(pageResults({ results: [{ id: 1 }] }), [{ id: 1 }]);
  assert.deepEqual(pageResults({ results: null }), []);
  assert.equal(entityId({ pk: 12 }), 12);
  assert.equal(entityId(7), 7);
});

test("missing metrics remain unavailable instead of becoming false zeroes", () => {
  assert.equal(mapDashboardMetrics("freelancer", { counts: {} }).proposalsSent, null);
  assert.equal(mapDashboardMetrics("client", null).proposalsReceived, null);
});