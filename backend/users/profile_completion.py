from rest_framework.exceptions import PermissionDenied


BIO_MIN_LENGTH = 30


def _has_meaningful_text(value, min_length=1):
    return isinstance(value, str) and len(value.strip()) >= min_length


def _has_valid_list_entry(value):
    return isinstance(value, list) and any(
        isinstance(item, str) and item.strip()
        for item in value
    )


def get_profile_completion(user):
    missing = []
    if not _has_meaningful_text(getattr(user, "first_name", None)):
        missing.append("first_name")
    if not _has_meaningful_text(getattr(user, "last_name", None)):
        missing.append("last_name")
    if not _has_meaningful_text(getattr(user, "bio", None), BIO_MIN_LENGTH):
        missing.append("bio")

    user_type = getattr(user, "user_type", None)
    if user_type == "freelancer":
        if not _has_valid_list_entry(getattr(user, "skills", None)):
            missing.append("skills")
    elif user_type == "client":
        has_business_field = _has_valid_list_entry(getattr(user, "business_fields", None))
        has_company_description = _has_meaningful_text(
            getattr(user, "company_description", None),
            BIO_MIN_LENGTH,
        )
        if not (has_business_field or has_company_description):
            missing.append("business_fields_or_company_description")
    else:
        missing.append("user_type")

    is_complete = not missing
    return {
        "is_complete": is_complete,
        "percentage": round((4 - min(len(missing), 4)) / 4 * 100),
        "missing": missing,
        "can_create_project": is_complete and user_type == "client",
        "can_initiate_chat": is_complete and user_type in {"client", "freelancer"},
        "can_submit_proposal": is_complete and user_type == "freelancer",
    }


def require_profile_completion(user, action):
    capability_by_action = {
        "create_project": "can_create_project",
        "initiate_chat": "can_initiate_chat",
        "submit_proposal": "can_submit_proposal",
    }
    try:
        capability = capability_by_action[action]
    except KeyError:
        raise ValueError(f"Unsupported profile-gated action: {action}") from None

    completion = get_profile_completion(user)
    if completion[capability]:
        return completion

    detail_by_action = {
        "create_project": "Complete your client profile before creating a project.",
        "initiate_chat": "Complete your profile before starting a conversation.",
        "submit_proposal": "Complete your freelancer profile before submitting a proposal.",
    }
    raise PermissionDenied({
        "code": "profile_incomplete",
        "detail": detail_by_action[action],
        "missing": completion["missing"],
        "profile_completion": completion,
        "edit_profile": "/dashboard/profile",
    })