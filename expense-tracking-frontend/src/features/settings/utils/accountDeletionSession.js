export const DELETION_PENDING_SESSION_KEY = "accountDeletionPending";

export const markDeletionPendingSession = () => {
  sessionStorage.setItem(DELETION_PENDING_SESSION_KEY, "1");
};

export const clearDeletionPendingSession = () => {
  sessionStorage.removeItem(DELETION_PENDING_SESSION_KEY);
};

export const isDeletionPendingSession = () =>
  sessionStorage.getItem(DELETION_PENDING_SESSION_KEY) === "1";
