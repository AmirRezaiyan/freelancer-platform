import api from "./axios";

export async function list(projectId) {
  if (!projectId) return [];
  const res = await api.get(`/market/projects/${projectId}/user_messages/`);
  return res.data;
}

export async function send(projectId, text = "", file = null) {
  const form = new FormData();
  form.append("project", projectId);
  form.append("message", text ?? "");

  if (file) {
    form.append("file", file);
    form.append("attachment", file);
  }

  const res = await api.post("/market/user_messages/create/", form);
  return res.data;
}

export default { list, send };