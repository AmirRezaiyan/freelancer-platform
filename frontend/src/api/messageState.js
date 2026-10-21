export async function markAllProjectMessagesRead(apiClient) {
  const response = await apiClient.post("/market/messages/mark-all-read/");
  if (!Number.isInteger(response.data?.updated)) {
    throw new Error("The server did not confirm the unread-message update.");
  }
  return response.data;
}

export function isUnreadFromOther(message, currentUserId) {
  if (!message || currentUserId == null) return false;

  const sender = message.sender;
  const senderId = typeof sender === "object"
    ? sender?.id ?? sender?.pk
    : message.sender_id ?? sender;
  const read = message.read ?? message.is_read;

  return read === false && senderId != null && String(senderId) !== String(currentUserId);
}
