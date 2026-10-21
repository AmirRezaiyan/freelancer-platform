const registrationRoles = new Set(["client", "freelancer"]);

export function registrationPath(role) {
  return registrationRoles.has(role) ? `/register?role=${role}` : "/register";
}

export function registrationRole(search) {
  const role = new URLSearchParams(search).get("role");
  return registrationRoles.has(role) ? role : "";
}