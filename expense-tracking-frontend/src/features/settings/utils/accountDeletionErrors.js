export const isGracePeriodDeletionError = (errorOrResponse) => {
  const data =
    errorOrResponse?.response?.data ||
    errorOrResponse?.originalError?.response?.data ||
    errorOrResponse;

  const code = data?.error;
  const accountStatus = data?.accountStatus;

  return code === "ACCOUNT_DELETION_IN_PROGRESS" && accountStatus === "DELETION_PENDING";
};

export default isGracePeriodDeletionError;
