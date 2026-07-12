const USER_FIELDS = ["user", "recipient", "requester", "blockedUser", "friend", "profile"];

const IMAGE_KEYS = ["profilePicture", "profileImage", "image", "avatar"];

function hasMeaningfulText(value) {
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "null" && normalized !== "undefined";
}

export function normalizeUserId(id) {
  if (id == null || id === "") return null;
  return String(id);
}

function isUserLike(value) {
  if (!value || typeof value !== "object") return false;
  return Boolean(
    hasMeaningfulText(value.firstName) ||
      hasMeaningfulText(value.lastName) ||
      hasMeaningfulText(value.displayName) ||
      hasMeaningfulText(value.fullName) ||
      hasMeaningfulText(value.name) ||
      hasMeaningfulText(value.email) ||
      IMAGE_KEYS.some((key) => value[key])
  );
}

function pickUserCandidate(obj) {
  if (!obj || typeof obj !== "object") return null;
  for (const field of USER_FIELDS) {
    if (isUserLike(obj[field])) return obj[field];
  }
  return isUserLike(obj) ? obj : null;
}

export function resolveOtherUser(obj, currentUserId) {
  if (!obj || typeof obj !== "object") return null;

  const selfId = normalizeUserId(currentUserId);
  const requester = obj.requester;
  const recipient = obj.recipient;

  if (requester && recipient) {
    const requesterId = normalizeUserId(requester.id ?? obj.requesterId ?? obj.requesterUserId);
    const recipientId = normalizeUserId(recipient.id ?? obj.recipientId ?? obj.recipientUserId);

    if (selfId) {
      if (requesterId === selfId) return recipient;
      if (recipientId === selfId) return requester;
    }

    if (obj.direction === "incoming" || obj._direction === "incoming") return requester;
    if (obj.direction === "outgoing" || obj._direction === "outgoing") return recipient;
  }

  if (selfId && requester && normalizeUserId(requester.id) !== selfId) return requester;
  if (selfId && recipient && normalizeUserId(recipient.id) !== selfId) return recipient;

  const direct = pickUserCandidate(obj);
  if (direct) return direct;

  if (requester) return requester;
  if (recipient) return recipient;

  return isUserLike(obj) ? obj : null;
}

export function resolveProfileImage(user) {
  if (!user) return null;
  for (const key of IMAGE_KEYS) {
    if (user[key]) return user[key];
  }
  return null;
}

export function resolveDisplayName(user, unknownLabel = "Unknown user") {
  if (!user) return unknownLabel;

  const firstLast = [user.firstName, user.lastName]
    .filter(hasMeaningfulText)
    .join(" ")
    .trim();
  if (firstLast) return firstLast;

  const named =
    user.displayName || user.fullName || user.name || user.username || "";
  if (hasMeaningfulText(named)) return String(named).trim();

  if (hasMeaningfulText(user.email)) {
    const localPart = String(user.email).split("@")[0]?.trim();
    if (localPart) return localPart;
  }

  return unknownLabel;
}

export function resolveInitials(user) {
  if (!user) return "";

  const firstLast = [user.firstName, user.lastName]
    .filter(hasMeaningfulText)
    .map((value) => String(value)[0])
    .join("")
    .toUpperCase();
  if (firstLast) return firstLast;

  const named = user.displayName || user.fullName || user.name || user.username || "";
  if (hasMeaningfulText(named)) {
    const parts = String(named).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    if (parts[0]?.[0]) return parts[0][0].toUpperCase();
  }

  if (hasMeaningfulText(user.email)) {
    const localPart = String(user.email).split("@")[0]?.trim();
    if (localPart?.[0]) return localPart[0].toUpperCase();
  }

  return "";
}

export function resolveAccessLevel(obj, currentUserId) {
  if (!obj || typeof obj !== "object") return "NONE";

  const selfId = normalizeUserId(currentUserId);
  const requesterId = normalizeUserId(
    obj.requester?.id ?? obj.requesterId ?? obj.requesterUserId
  );
  const recipientId = normalizeUserId(
    obj.recipient?.id ?? obj.recipientId ?? obj.recipientUserId
  );

  if (selfId && (obj.requesterAccess != null || obj.recipientAccess != null)) {
    if (requesterId === selfId && obj.requesterAccess != null) {
      return obj.requesterAccess || "NONE";
    }
    if (recipientId === selfId && obj.recipientAccess != null) {
      return obj.recipientAccess || "NONE";
    }
    if (requesterId === selfId) return obj.requesterAccess || "NONE";
    if (recipientId === selfId) return obj.recipientAccess || "NONE";
  }

  if (obj.accessLevel != null) return obj.accessLevel || "NONE";

  const nested = obj.friendship || obj.share || obj.sharing;
  if (nested && nested !== obj) {
    return resolveAccessLevel(nested, currentUserId);
  }

  return "NONE";
}

export function resolveFriendDisplay(obj, { currentUserId, unknownLabel = "Unknown user" } = {}) {
  const user = resolveOtherUser(obj, currentUserId);
  return {
    user,
    displayName: resolveDisplayName(user, unknownLabel),
    initials: resolveInitials(user),
    profileImage: resolveProfileImage(user),
    accessLevel: resolveAccessLevel(obj, currentUserId),
    email: user?.email || "",
    userId: user?.id ?? obj?.userId ?? obj?.id ?? null,
  };
}
