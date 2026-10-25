import test from "node:test";
import assert from "node:assert/strict";
import {
  canCreateProject,
  canSubmitProposal,
  canSendConversationMessage,
  getProfileIncompleteDetails,
  getProfileMissingLabels,
  hasParticipantMessageHistory,
  PROFILE_EDITOR_PATH,
} from "../src/utils/profileCompletion.js";

test("completion requirement identifiers have Persian labels", () => {
  const labels = getProfileMissingLabels([
    "first_name",
    "last_name",
    "bio",
    "skills",
    "business_fields_or_company_description",
  ]);

  assert.equal(labels.length, 5);
  assert.ok(labels.every((label) => !label.includes("business_fields_or_company_description")));
  assert.ok(labels.every((label) => !label.includes("first_name")));
});

test("project creation requires the backend capability and client role", () => {
  assert.equal(canCreateProject({ user_type: "client", profile_completion: { can_create_project: true } }), true);
  assert.equal(canCreateProject({ user_type: "freelancer", profile_completion: { can_create_project: true } }), false);
  assert.equal(canCreateProject({ user_type: "client", profile_completion: { percentage: 100 } }), false);
  assert.equal(canCreateProject({ user_type: "client" }), false);
});

test("new messages require loaded history and backend eligibility, but replies survive profile/history issues", () => {
  const incompleteUser = { profile_completion: { can_initiate_chat: false } };
  const completeUser = { profile_completion: { can_initiate_chat: true } };

  assert.equal(canSendConversationMessage(incompleteUser, false, "loaded"), false);
  assert.equal(canSendConversationMessage(completeUser, false, "loaded"), true);
  assert.equal(canSendConversationMessage(undefined, false, "loaded"), false);
  assert.equal(canSendConversationMessage(incompleteUser, false, "loading"), false);
  assert.equal(canSendConversationMessage(incompleteUser, false, "denied"), false);
  assert.equal(canSendConversationMessage(incompleteUser, false, "error"), true);
  assert.equal(canSendConversationMessage(incompleteUser, true, "loaded"), true);
});

test("profile-incomplete API errors retain missing fields and ignore unrelated errors", () => {
  const details = getProfileIncompleteDetails({
    response: {
      data: {
        code: "profile_incomplete",
        missing: ["skills"],
        profile_completion: { can_initiate_chat: false },
        edit_profile: "/dashboard/profile",
      },
    },
  });

  assert.deepEqual(details.missing, ["حداقل یک مهارت معتبر"]);
  assert.deepEqual(details.missingFields, ["skills"]);
  assert.equal(details.profileCompletion.can_initiate_chat, false);
  assert.equal(details.editProfile, PROFILE_EDITOR_PATH);
  assert.equal(getProfileIncompleteDetails({ response: { data: { detail: "Forbidden" } } }), null);
});

test("only messages from the client or hired freelancer establish project conversation history", () => {
  const project = { client: 10, hired_freelancer: { id: 20 } };

  assert.equal(hasParticipantMessageHistory([{ sender_id: 99 }], project), false);
  assert.equal(hasParticipantMessageHistory([{ sender_id: 10 }], project), true);
  assert.equal(hasParticipantMessageHistory([{ sender: { id: 20 } }], project), true);
  assert.equal(hasParticipantMessageHistory([{ sender_id: 10 }], { client: 10 }), false);
});

test("proposal submission requires the backend capability and freelancer role", () => {
  const incomplete = { user_type: "freelancer", profile_completion: { can_submit_proposal: false } };
  const complete = { user_type: "freelancer", profile_completion: { can_submit_proposal: true } };

  assert.equal(canSubmitProposal(incomplete), false);
  assert.equal(canSubmitProposal(complete), true);
  assert.equal(canSubmitProposal(complete, true), false);
  assert.equal(canSubmitProposal({ user_type: "client", profile_completion: { can_submit_proposal: true } }), false);
  assert.equal(canSubmitProposal({ user_type: "freelancer" }), false);
  assert.equal(canSubmitProposal(null), false);
  assert.equal(canSubmitProposal({
    ...incomplete,
    profile_completion: { can_submit_proposal: true },
  }), true);
});