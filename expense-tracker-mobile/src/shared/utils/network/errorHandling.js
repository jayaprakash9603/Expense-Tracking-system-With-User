export function normalizeError(error) {
  if (typeof error === "string") return { message: error, code: null, status: null };

  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "An unexpected error occurred";

  return {
    message,
    code: error?.response?.data?.code || error?.code || null,
    status: error?.response?.status || null,
    raw: error,
  };
}

export function isNetworkError(error) {
  return !error?.response && error?.code === "ERR_NETWORK";
}

export function isAuthError(error) {
  const status = error?.response?.status || error?.status;
  return status === 401 || status === 403;
}

export function isValidationError(error) {
  return error?.response?.status === 400 || error?.response?.status === 422;
}

export function getValidationErrors(error) {
  const data = error?.response?.data;
  if (!data) return {};
  if (data.errors && typeof data.errors === "object") return data.errors;
  if (data.fieldErrors) return data.fieldErrors;
  return {};
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  const normalized = normalizeError(error);
  return normalized.message || fallback;
}
