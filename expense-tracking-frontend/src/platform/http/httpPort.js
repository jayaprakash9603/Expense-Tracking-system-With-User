/**
 * HTTP Port — the single transport contract every adapter implements.
 *
 * @typedef {Object} HttpRequest
 * @property {string} [endpointId]  Catalog key, e.g. "expenses.list"
 * @property {string} [path]        Raw path when endpointId is not used (legacy)
 * @property {string} [method]      HTTP method (default GET)
 * @property {Record<string, string|number>} [pathParams]
 * @property {Record<string, any>} [query]
 * @property {any} [body]
 * @property {Record<string, string>} [headers]
 * @property {AbortSignal} [signal]
 * @property {boolean} [skipAuth]
 * @property {string} [responseType]
 * @property {any} [data]           Alias for body (axios compat)
 * @property {Record<string, any>} [params] Alias for query (axios compat)
 *
 * @typedef {Object} HttpResponse
 * @property {any} data
 * @property {number} status
 * @property {Record<string, string>} headers
 *
 * @typedef {Object} HttpPort
 * @property {(req: HttpRequest) => Promise<HttpResponse>} request
 * @property {(url: string, config?: object) => Promise<HttpResponse>} get
 * @property {(url: string, data?: any, config?: object) => Promise<HttpResponse>} post
 * @property {(url: string, data?: any, config?: object) => Promise<HttpResponse>} put
 * @property {(url: string, data?: any, config?: object) => Promise<HttpResponse>} patch
 * @property {(url: string, config?: object) => Promise<HttpResponse>} delete
 * @property {object} [defaults] axios-compat defaults
 * @property {object} [interceptors] axios-compat interceptors (optional)
 * @property {any} [_axios] underlying axios instance when available
 */

/**
 * Dev-time shape guard for HttpPort implementations.
 * @param {any} candidate
 * @returns {candidate is HttpPort}
 */
export const assertHttpPort = (candidate) => {
  if (!candidate || typeof candidate.request !== "function") {
    throw new Error("HttpPort must implement request()");
  }
  return true;
};

/**
 * Wrap a port with axios-style convenience methods (get/post/put/patch/delete).
 * @param {{ request: Function, defaults?: object, interceptors?: object, _axios?: any }} port
 * @returns {HttpPort}
 */
export const withAxiosCompat = (port) => {
  const call = (method, url, dataOrConfig, maybeConfig) => {
    const hasBody = method !== "GET" && method !== "DELETE" && method !== "HEAD";
    let data;
    let config;
    if (hasBody) {
      data = dataOrConfig;
      config = maybeConfig || {};
    } else {
      config = dataOrConfig || {};
    }
    return port.request({
      path: url,
      method,
      body: data,
      data,
      query: config.params,
      params: config.params,
      headers: config.headers,
      signal: config.signal,
      skipAuth: config.skipAuth,
      responseType: config.responseType,
      ...config,
    });
  };

  return Object.freeze({
    request: port.request.bind(port),
    get: (url, config) => call("GET", url, config),
    post: (url, data, config) => call("POST", url, data, config),
    put: (url, data, config) => call("PUT", url, data, config),
    patch: (url, data, config) => call("PATCH", url, data, config),
    delete: (url, config) => call("DELETE", url, config),
    defaults: port.defaults,
    interceptors: port.interceptors,
    _axios: port._axios,
  });
};
