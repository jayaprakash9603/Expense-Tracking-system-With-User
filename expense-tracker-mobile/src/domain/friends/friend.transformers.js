export function fromApiResponse(raw) {
  return {
    id: raw.id,
    userId: raw.userId || raw.friendId || "",
    name: raw.name || raw.friendName || "",
    email: raw.email || raw.friendEmail || "",
    avatar: raw.avatar || raw.profileImage || "",
    status: raw.status || "PENDING",
    permission: raw.permission || "VIEW",
    sharedSince: raw.sharedSince || raw.createdAt || "",
  };
}

export function toListItem(friend) {
  return {
    id: friend.id,
    title: friend.name,
    subtitle: friend.email,
    avatar: friend.avatar,
    status: friend.status,
    permission: friend.permission,
  };
}
