export const FRIEND_STATUSES = ["PENDING", "ACCEPTED", "BLOCKED"];
export const SHARE_PERMISSIONS = ["VIEW", "EDIT", "FULL"];

export const FRIEND_DEFAULTS = {
  userId: "",
  status: "PENDING",
  permission: "VIEW",
};

export function createFriendRequest(overrides = {}) {
  return { ...FRIEND_DEFAULTS, ...overrides };
}
