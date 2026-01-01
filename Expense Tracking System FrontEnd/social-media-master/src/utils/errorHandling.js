import {
  dispatchSystemErrorEvent,
  buildSystemErrorPayloadFromAxios,
  AXIOS_ERROR_FLAG,
} from "./systemErrorEvents";

export const normalizeApiError = (error) => {
  if (!error) {
    return { message: "An unexpected error occurred." };
  }

  if (error.isAxiosError || error.response || error.config) {
    const payload = buildSystemErrorPayloadFromAxios(error);
    return {
      ...payload,
      message: payload.message || "An unexpected error occurred.",
      __isHandled: Boolean(error[AXIOS_ERROR_FLAG]),
      __rawError: error,
    };
  }

  return {
    message: error.message || String(error),
    __rawError: error,
  };
};

export const flagAndDispatchError = (error) => {
  const normalized = normalizeApiError(error);
  if (!normalized.__isHandled) {
    dispatchSystemErrorEvent(normalized);
    if (normalized.__rawError) {
      normalized.__rawError[AXIOS_ERROR_FLAG] = true;
    }
  }
  return normalized;
};

export const maskErrorForUi = (error, fallbackMessage) =>
  error?.message || fallbackMessage || "Something went wrong.";
