import {
  attachSystemErrorPayload,
  buildSystemErrorPayloadFromAxios,
  AXIOS_ERROR_FLAG,
} from "../utils/systemErrorEvents";

const shouldHandleAxiosError = (error) => {
  if (!error) {
    return false;
  }
  if (error[AXIOS_ERROR_FLAG]) {
    return false;
  }
  return Boolean(error.isAxiosError || error.response || error.config);
};

const handleAxiosLikeError = (error) => {
  if (!shouldHandleAxiosError(error)) {
    return false;
  }

  attachSystemErrorPayload(error, buildSystemErrorPayloadFromAxios(error));
  return true;
};

const suppressEvent = (event) => {
  if (!event) {
    return;
  }
  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  if (typeof event.stopImmediatePropagation === "function") {
    event.stopImmediatePropagation();
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (!event) {
      return;
    }
    const reason = event.reason;
    if (handleAxiosLikeError(reason)) {
      suppressEvent(event);
    }
  });

  window.addEventListener("error", (event) => {
    if (!event) {
      return;
    }
    const error = event.error;
    if (handleAxiosLikeError(error)) {
      suppressEvent(event);
    }
  });
}
