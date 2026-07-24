import { isDeletionPendingSession } from "./accountDeletionSession";

export const isGracePeriodDeletionError = (errorOrResponse) => {
  const data =
    errorOrResponse?.response?.data ||
    errorOrResponse?.originalError?.response?.data ||
    errorOrResponse?.payload ||
    errorOrResponse;

  const accountStatus = data?.accountStatus;
  const code = data?.error || data?.errorCode;

  if (accountStatus === "DELETION_PENDING") {
    return true;
  }

  if (
    isDeletionPendingSession() &&
    accountStatus !== "PURGING" &&
    accountStatus !== "DELETED" &&
    accountStatus !== "FAILED"
  ) {
    return true;
  }

  return (
    code === "ACCOUNT_DELETION_IN_PROGRESS" && accountStatus === "DELETION_PENDING"
  );
};

export default isGracePeriodDeletionError;
