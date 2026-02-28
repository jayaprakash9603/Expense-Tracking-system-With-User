const generateSystemErrorId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const AXIOS_ERROR_FLAG = "__systemErrorHandled";
export const SYSTEM_ERROR_PAYLOAD_KEY = "__systemErrorPayload";

const ensureDetailShape = ({
  id,
  status,
  message,
  method,
  path,
  timestamp,
} = {}) => ({
  id: id || generateSystemErrorId(),
  status,
  message: message || "An unexpected error occurred.",
  method,
  path,
  timestamp: timestamp || Date.now(),
});

export const dispatchSystemErrorEvent = ({
  id,
  status,
  message,
  method,
  path,
  timestamp,
} = {}) => {
  if (typeof window === "undefined") {
    return null;
  }

  const detail = ensureDetailShape({
    id,
    status,
    message,
    method,
    path,
    timestamp,
  });

  window.dispatchEvent(
    new CustomEvent("systemError", {
      detail,
    })
  );

  return detail;
};

export const buildSystemErrorPayloadFromAxios = (error) => {
  if (!error) {
    return {};
  }
  const status = error.response?.status || error.status;
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "An unexpected error occurred.";
  const method = error.config?.method
    ? error.config.method.toUpperCase()
    : undefined;
  const path = error.config?.url || error.response?.data?.path;

  return {
    status,
    message,
    method,
    path,
  };
};

export const attachSystemErrorPayload = (error, overrides = {}) => {
  if (!error) {
    return ensureDetailShape(overrides);
  }

  if (error[SYSTEM_ERROR_PAYLOAD_KEY]) {
    return error[SYSTEM_ERROR_PAYLOAD_KEY];
  }

  const payload = {
    ...buildSystemErrorPayloadFromAxios(error),
    ...overrides,
  };

  const detail =
    dispatchSystemErrorEvent(payload) || ensureDetailShape(payload);

  error[AXIOS_ERROR_FLAG] = true;
  error[SYSTEM_ERROR_PAYLOAD_KEY] = detail;
  return detail;
};

export const extractSystemErrorPayload = (error) =>
  error?.[SYSTEM_ERROR_PAYLOAD_KEY];
