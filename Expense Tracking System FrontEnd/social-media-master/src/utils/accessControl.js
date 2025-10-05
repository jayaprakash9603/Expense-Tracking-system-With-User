// Centralized access control helpers (DRY)
// Assumed friendship object shape:
// {
//   id, requesterId, recipientId,
//   requesterAccess: 'NONE'|'READ'|'WRITE'|'FULL',
//   recipientAccess: 'NONE'|'READ'|'WRITE'|'FULL'
// }
// Some API responses in this project embed 'friendship' inside a user object, adapt upstream if needed.

const WRITE_LEVELS = new Set(["WRITE", "FULL"]);
const READ_LEVELS = new Set(["READ", "WRITE", "FULL"]);

// Returns standardized upper-case level or 'NONE'.
export function normalizeLevel(level) {
  if (!level) return "NONE";
  const up = String(level).toUpperCase();
  if (["NONE", "READ", "WRITE", "FULL"].includes(up)) return up;
  return "NONE";
}

export function getAccessLevel({ friendship, currentUserId, targetUserId }) {
  console.log(
    friendship.recipient.id,
    currentUserId,
    "reciepient access",
    friendship.recipientAccess
  );

  return friendship?.requester.id === currentUserId
    ? friendship?.recipientAccess
    : friendship?.requesterAccess;
}

export function canWrite(params) {
  return WRITE_LEVELS.has(getAccessLevel(params));
}

export function canRead(params) {
  return READ_LEVELS.has(getAccessLevel(params));
}

// Returns a rich permission object describing the relationship for UI decisions.
// Example friendship response:
// {
//   id:1,
//   requester:{ id:1, ...},
//   recipient:{ id:2, ...},
//   requesterAccess:'WRITE',
//   recipientAccess:'WRITE'
// }
// If currentUserId=1 viewing targetUserId=2 => accessLevel=WRITE, perspective='requester'.
export function resolveAccess({ friendship, currentUserId, targetUserId }) {
  const rawLevel = getAccessLevel({ friendship, currentUserId, targetUserId });
  if (!targetUserId || targetUserId === currentUserId) {
    return {
      perspective: "self",
      accessLevel: "FULL",
      canWrite: true,
      canRead: true,
      isOwn: true,
    };
  }
  if (!friendship) {
    return {
      perspective: "none",
      accessLevel: "NONE",
      canWrite: false,
      canRead: false,
      isOwn: false,
    };
  }
  const { requesterId, recipientId, requester, recipient } = friendship;
  const reqId = requesterId || requester?.id;
  const recId = recipientId || recipient?.id;
  let perspective = "unknown";
  if (currentUserId === reqId && targetUserId === recId)
    perspective = "requester";
  else if (currentUserId === recId && targetUserId === reqId)
    perspective = "recipient";

  return {
    perspective,
    accessLevel: rawLevel,
    canWrite: WRITE_LEVELS.has(rawLevel),
    canRead: READ_LEVELS.has(rawLevel),
    isOwn: false,
  };
}

export default { getAccessLevel, canWrite, canRead, resolveAccess };
