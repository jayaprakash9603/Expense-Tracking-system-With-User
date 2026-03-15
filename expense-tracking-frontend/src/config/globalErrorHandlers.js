import {
  attachSystemErrorPayload,
  buildSystemErrorPayloadFromAxios,
  AXIOS_ERROR_FLAG,
} from "../utils/systemErrorEvents";

const shouldHandleError = (error) => {
  if (!error) {
    return false;
  }
  if (error[AXIOS_ERROR_FLAG]) {
    return false;
  }
  return true;
};

const handleAnyError = (error) => {
  if (!shouldHandleError(error)) {
    return false;
  }

  let payload = {};
  if (error.isAxiosError || error.response || error.config) {
    payload = buildSystemErrorPayloadFromAxios(error);
  } else {
    payload = {
      message: error.message || String(error),
      status: "APP_ERROR",
      path: error.stack ? "Frontend Error" : undefined,
    };
  }

  attachSystemErrorPayload(error, payload);
  return true;
};

const suppressEvent = (event) => {
  if (!event) {
    return;
  }
  if (typeof event.preventDefault === "function") {
    // We might not want to suppress all non-axios errors, but user requested to capture all
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (!event) {
      return;
    }
    const reason = event.reason;
    handleAnyError(reason);
  });

  window.addEventListener("error", (event) => {
    if (!event) {
      return;
    }
    const error = event.error || event.message;
    handleAnyError(error);
  });
}
