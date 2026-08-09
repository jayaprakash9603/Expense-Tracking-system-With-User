import axios from "axios";
import { createHttpErrorHandler } from "../../errors/errorBus";
import { withAxiosCompat } from "../httpPort";

const AUTH_HEADER_KEY = "Authorization";

const isCanceledError = (error) =>
  axios.isCancel(error) ||
  error?.code === "ERR_CANCELED" ||
  error?.message === "canceled" ||
  error?.name === "CanceledError";

/**
 * Live (and snow) HTTP adapter backed by axios.
 *
 * @param {{
 *   baseURL: string,
 *   tokenPort: import('../../auth/tokenPort').TokenPort,
 *   resolvePath?: (req: object) => { url: string, method: string, skipAuth?: boolean },
 * }} options
 */
export const createAxiosHttpAdapter = ({
  baseURL,
  tokenPort,
  resolvePath,
} = {}) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const handleRequest = (config = {}) => {
    const requestConfig = config;
    requestConfig.headers = requestConfig.headers || {};
    const shouldSkipAuth = requestConfig.skipAuth === true;

    if (!shouldSkipAuth) {
      if (!requestConfig.headers[AUTH_HEADER_KEY]) {
        const token = tokenPort?.getToken?.();
        if (token) {
          requestConfig.headers[AUTH_HEADER_KEY] = `Bearer ${token}`;
        }
      }
    } else if (requestConfig.headers[AUTH_HEADER_KEY]) {
      delete requestConfig.headers[AUTH_HEADER_KEY];
    }

    requestConfig._skipAuth = shouldSkipAuth;
    if (shouldSkipAuth) {
      delete requestConfig.skipAuth;
    }

    return requestConfig;
  };

  const handleResponseError = createHttpErrorHandler({
    tokenPort,
    isCanceled: isCanceledError,
  });

  instance.interceptors.request.use(handleRequest, (error) =>
    Promise.reject(error),
  );
  instance.interceptors.response.use((response) => response, handleResponseError);

  // Attach once to the global axios default instance for any remaining
  // legacy callers. Guard prevents stacking on rebuildContainer().
  if (!axios.__hexagonalInterceptorsAttached) {
    axios.interceptors.request.use(handleRequest, (error) =>
      Promise.reject(error),
    );
    axios.interceptors.response.use(
      (response) => response,
      handleResponseError,
    );
    axios.__hexagonalInterceptorsAttached = true;
  }

  const request = async (req = {}) => {
    let url = req.path || "";
    let method = (req.method || "GET").toUpperCase();
    let skipAuth = req.skipAuth;

    if (req.endpointId && typeof resolvePath === "function") {
      const resolved = resolvePath(req);
      url = resolved.url;
      method = (resolved.method || method).toUpperCase();
      if (resolved.skipAuth !== undefined) {
        skipAuth = resolved.skipAuth;
      }
    }

    if (req.pathParams && typeof req.pathParams === "object") {
      Object.entries(req.pathParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
        url = url.replace(`:${key}`, encodeURIComponent(String(value)));
      });
    }

    const response = await instance.request({
      url,
      method,
      params: req.query ?? req.params,
      data: req.body ?? req.data,
      headers: req.headers,
      signal: req.signal,
      skipAuth,
      responseType: req.responseType,
    });

    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  };

  const port = {
    request,
    defaults: instance.defaults,
    interceptors: instance.interceptors,
    _axios: instance,
  };

  return withAxiosCompat(port);
};

export { isCanceledError };
