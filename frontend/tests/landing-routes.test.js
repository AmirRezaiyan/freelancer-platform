import assert from "node:assert/strict";
import test from "node:test";
import { registrationPath, registrationRole } from "../src/utils/landingRoutes.js";

test("landing role actions link to the corresponding changeable registration choice", () => {
  assert.equal(registrationPath("client"), "/register?role=client");
  assert.equal(registrationPath("freelancer"), "/register?role=freelancer");
  assert.equal(registrationPath("unknown"), "/register");
  assert.equal(registrationRole("?role=client"), "client");
  assert.equal(registrationRole("?role=freelancer"), "freelancer");
});

test("invalid or absent landing role parameters do not select a registration role", () => {
  assert.equal(registrationRole(""), "");
  assert.equal(registrationRole("?role=admin"), "");
});