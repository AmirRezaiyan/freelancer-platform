export async function markAllProjectMessagesRead(apiClient) {
  const response = await apiClient.post("/market/messages/mark-all-read/");
  if (!Number.isInteger(response.data?.updated)) {
    throw new Error("The server did not confirm the unread-message update.");
  }
  return response.data;
}
