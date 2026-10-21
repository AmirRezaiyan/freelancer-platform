import assert from "node:assert/strict";
import test from "node:test";
import { proposalDetailPath } from "../src/api/paths.js";

const apiBaseUrl = "http://localhost:8001/api";

function resolveAxiosRelativeUrl(path) {
  return `${apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

test("proposal edit and withdraw paths retain the single API prefix", () => {
  assert.equal(proposalDetailPath(42), "/market/proposals/42/");
  assert.equal(
    resolveAxiosRelativeUrl(proposalDetailPath(42)),
    "http://localhost:8001/api/market/proposals/42/",
  );
});
