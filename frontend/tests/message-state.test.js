import assert from "node:assert/strict";
import test from "node:test";
import { markAllProjectMessagesRead } from "../src/api/messageState.js";

test("bulk mark-read resolves only after the API confirms its update count", async () => {
  const calls = [];
  const result = await markAllProjectMessagesRead({
    async post(path) {
      calls.push(path);
      return { data: { updated: 24 } };
    },
  });

  assert.deepEqual(calls, ["/market/messages/mark-all-read/"]);
  assert.deepEqual(result, { updated: 24 });
});

test("bulk mark-read failures remain failures and cannot be mistaken for success", async () => {
  const requestError = new Error("HTTP 503");
  await assert.rejects(
    markAllProjectMessagesRead({ async post() { throw requestError; } }),
    requestError,
  );
  await assert.rejects(
    markAllProjectMessagesRead({ async post() { return { data: {} }; } }),
    /did not confirm/,
  );
});
