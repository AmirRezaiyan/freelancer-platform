import assert from "node:assert/strict";
import test from "node:test";
import { entityId, mapDashboardMetrics, ownedProjects, pageResults } from "../src/utils/dashboardData.js";

test("client dashboard metrics use client counts from the API", () => {
  assert.deepEqual(mapDashboardMetrics("client", {
    counts: { projects_total: 4, in_progress: 2, proposals_received: 7 },
  }), {
    projectsTotal: 4,
    activeProjects: 2,
    proposalsReceived: 7,
  });
});

test("freelancer dashboard metrics use proposal and contract counts", () => {
  assert.deepEqual(mapDashboardMetrics("freelancer", {
    counts: { proposals_sent: 9, active_contracts: 1, earnings: 125000 },
  }, { pending: 4 }), {
    proposalsSent: 9,
    pendingProposals: 4,
    activeContracts: 1,
    acceptedProposalValue: 125000,
  });
});

test("dashboard response helpers handle paginated and related entity shapes", () => {
  assert.deepEqual(pageResults({ results: [{ id: 1 }] }), [{ id: 1 }]);
  assert.deepEqual(pageResults({ results: null }), []);
  assert.equal(entityId({ pk: 12 }), 12);
  assert.equal(entityId(7), 7);
});

test("client dashboard shows only the authenticated client's projects", () => {
  assert.deepEqual(ownedProjects({ results: [
    { id: 1, client: 7 },
    { id: 2, client: { pk: 8 } },
    { id: 3, client: { id: 7 } },
  ] }, 7), [
    { id: 1, client: 7 },
    { id: 3, client: { id: 7 } },
  ]);
  assert.deepEqual(ownedProjects([{ id: 1, client: 7 }], null), []);
});

test("missing metrics remain unavailable instead of becoming false zeroes", () => {
  assert.equal(mapDashboardMetrics("freelancer", { counts: {} }).proposalsSent, null);
  assert.equal(mapDashboardMetrics("client", null).proposalsReceived, null);
});