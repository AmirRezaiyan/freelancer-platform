import assert from "node:assert/strict";
import test from "node:test";
import { proposalDetailPath } from "../src/api/paths.js";
import { buildProposalPayload, validateProposalBid } from "../src/utils/proposalPayload.js";
import { formatProjectCategory } from "../src/utils/formatters.js";

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

test("proposal creation uses the supported project, message, and bid_amount fields", () => {
  assert.deepEqual(buildProposalPayload(42, "125000", "پیشنهاد همکاری"), {
    project: 42,
    message: "پیشنهاد همکاری",
    bid_amount: 125000,
  });
});

test("proposal bids must be positive integers within optional project bounds", () => {
  assert.equal(validateProposalBid("-5"), "مبلغ پیشنهاد باید عدد صحیح و مثبت باشد.");
  assert.equal(validateProposalBid("1.5"), "مبلغ پیشنهاد باید عدد صحیح و مثبت باشد.");
  assert.equal(validateProposalBid("99", 100, 200), "مبلغ پیشنهاد کمتر از حداقل بودجه پروژه است.");
  assert.equal(validateProposalBid("201", 100, 200), "مبلغ پیشنهاد بیشتر از حداکثر بودجه پروژه است.");
  assert.equal(validateProposalBid("100", 100, 100), null);
  assert.equal(validateProposalBid("500"), null);
});

test("project categories use localized labels and preserve unknown API values", () => {
  assert.equal(formatProjectCategory("web"), "توسعه وب");
  assert.equal(formatProjectCategory("mobile"), "توسعه موبایل");
  assert.equal(formatProjectCategory("other"), "سایر");
  assert.equal(formatProjectCategory("future-category"), "future-category");
  assert.equal(formatProjectCategory(null), "نامشخص");
});
