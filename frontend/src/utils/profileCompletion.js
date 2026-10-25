const missingRequirementLabels = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  bio: "بیوگرافی معنادار (حداقل ۳۰ نویسه)",
  skills: "حداقل یک مهارت معتبر",
  business_fields_or_company_description: "یک زمینه فعالیت یا توضیح شرکت (حداقل ۳۰ نویسه)",
  user_type: "نوع حساب کاربری",
};

export const PROFILE_EDITOR_PATH = "/dashboard/profile";

export function getProfileMissingLabels(missing = []) {
  if (!Array.isArray(missing)) return [];
  return missing.map((field) => missingRequirementLabels[field] || "اطلاعات پروفایل");
}

export function canCreateProject(user) {
  return user?.user_type === "client" && user?.profile_completion?.can_create_project === true;
}

export function canSubmitProposal(user, profileRefreshing = false) {
  return !profileRefreshing
    && user?.user_type === "freelancer"
    && user?.profile_completion?.can_submit_proposal === true;
}

export function canSendConversationMessage(user, hasMessageHistory, historyState) {
  if (hasMessageHistory) return true;
  if (historyState === "error") return true;
  if (historyState !== "loaded") return false;
  return user?.profile_completion?.can_initiate_chat === true;
}

export function hasParticipantMessageHistory(messages, project) {
  const entityId = (value) => value && typeof value === "object"
    ? value.id ?? value.pk ?? null
    : value;
  const participantIds = [entityId(project?.client), entityId(project?.hired_freelancer)]
    .filter((id) => id !== null && id !== undefined)
    .map(String);
  if (!participantIds.length || !entityId(project?.hired_freelancer)) return false;

  return (Array.isArray(messages) ? messages : []).some((message) => {
    const senderId = entityId(message?.sender_id ?? message?.sender);
    return senderId !== null && senderId !== undefined && participantIds.includes(String(senderId));
  });
}

export function getProfileIncompleteDetails(error) {
  const data = error?.response?.data;
  if (data?.code !== "profile_incomplete") return null;

  return {
    missing: getProfileMissingLabels(data.missing),
    missingFields: Array.isArray(data.missing) ? data.missing : [],
    profileCompletion: data.profile_completion || null,
    editProfile: data.edit_profile || PROFILE_EDITOR_PATH,
  };
}