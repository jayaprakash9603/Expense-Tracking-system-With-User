export async function safeApiCall(apiCallFn) {
  try {
    const response = await apiCallFn();
    return { data: response.data, error: null };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "An unexpected error occurred.";

    return { data: null, error: { message, status, raw: err } };
  }
}
