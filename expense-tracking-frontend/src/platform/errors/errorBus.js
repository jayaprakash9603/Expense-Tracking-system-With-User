/**
 * Typed error bus that also re-dispatches the legacy window CustomEvents
 * (show403Error, show404Error, unauthorized, systemError) so existing
 * GlobalErrorHandler / SystemErrorIndicator keep working unchanged.
 */

import {
  attachSystemErrorPayload,
  buildSystemErrorPayloadFromAxios,
} from "../../utils/api/systemErrorEvents";
import isGracePeriodDeletionError from "../../features/settings/utils/accountDeletionErrors";

const listeners = new Map();

const emitWindow = (name, detail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

/**
 * @param {string} event
 * @param {(detail: any) => void} handler
 * @returns {() => void} unsubscribe
 */
export const onError = (event, handler) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
};

const notify = (event, detail) => {
  const set = listeners.get(event);
  if (set) {
    set.forEach((handler) => {
      try {
        handler(detail);
      } catch {
        /* never break the bus */
      }
    });
  }
};

export const emitForbidden = (detail) => {
  notify("forbidden", detail);
  emitWindow("show403Error", detail);
};

export const emitNotFound = (detail) => {
  notify("notFound", detail);
  emitWindow("show404Error", detail);
};

export const emitUnauthorized = (detail) => {
  notify("unauthorized", detail);
  emitWindow("unauthorized", detail);
};

const shouldNormalizeStatus = (status) =>
  status === 401 ||
  status === 403 ||
  (typeof status === "number" && status >= 500 && status < 600);

/**
 * Create an axios response-error handler with the same semantics as the
 * legacy api.js interceptors.
 *
 * @param {{ tokenPort?: { clearToken: () => void }, isCanceled?: (e: any) => boolean }} deps
 */
export const createHttpErrorHandler = ({ tokenPort, isCanceled } = {}) => {
  return (error) => {
    if (isCanceled?.(error)) {
      return Promise.reject(error);
    }

    if (error?.response) {
      const { status } = error.response;
      const responseMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "An unexpected error occurred.";

      const attachSystemError = () =>
        attachSystemErrorPayload(error, {
          status,
          message: responseMessage,
        });

      switch (status) {
        case 403:
          if (!isGracePeriodDeletionError(error)) {
            emitForbidden({
              message:
                error.response.data?.message ||
                "Access denied. You do not have permission to access this resource.",
              originalError: error,
            });
          }
          attachSystemError();
          break;
        case 404:
          emitNotFound({
            message:
              error.response.data?.message ||
              "The requested resource was not found.",
            originalError: error,
          });
          break;
        case 401:
          if (!error.config?._skipAuth) {
            tokenPort?.clearToken();
            emitUnauthorized({
              message: "Your session has expired. Please login again.",
              originalError: error,
            });
          }
          attachSystemError();
          break;
        default:
          if (shouldNormalizeStatus(status)) {
            attachSystemError();
          }
      }
    } else {
      attachSystemErrorPayload(error, {
        ...buildSystemErrorPayloadFromAxios(error),
        status: "NETWORK",
        message: error?.message || "Network error",
      });
    }

    return Promise.reject(error);
  };
};
