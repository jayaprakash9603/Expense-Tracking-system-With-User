import {
  attachSystemErrorPayload,
  buildSystemErrorPayloadFromAxios,
  extractSystemErrorPayload,
} from "./systemErrorEvents";

const defaultDataResolver = (response) =>
  response && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response;

/**
 * Wraps an API request so callers can safely await without try/catch.
 * Returns `{ data, error }` where `error` is a normalized system error payload.
 */
export const safeApiCall = async (requestFn, options = {}) => {
  if (typeof requestFn !== "function") {
    throw new Error("safeApiCall expects a function that returns a promise");
  }

  const { resolveData = defaultDataResolver, throwOnError = false } = options;

  try {
    const response = await requestFn();
    return {
      data: resolveData(response),
      response,
      status: response?.status,
      headers: response?.headers,
    };
  } catch (error) {
    let payload = extractSystemErrorPayload(error);

    if (!payload) {
      payload = attachSystemErrorPayload(
        error,
        buildSystemErrorPayloadFromAxios(error)
      );
    }

    if (throwOnError) {
      const normalizedError = new Error(payload?.message || "Request failed");
      normalizedError.payload = payload;
      normalizedError.status = payload?.status;
      normalizedError.originalError = error;
      throw normalizedError;
    }

    return {
      data: null,
      error: payload,
      status: payload?.status ?? error?.response?.status,
    };
  }
};
