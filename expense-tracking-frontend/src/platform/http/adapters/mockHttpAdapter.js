import { withAxiosCompat } from "../httpPort";

/**
 * In-browser mock HTTP adapter. Routes by endpointId or path against a
 * handler map; useful for tests and offline demos.
 *
 * @param {{
 *   handlers?: Record<string, (req: object) => Promise<object>|object>,
 *   defaultStatus?: number,
 * }} [options]
 */
export const createMockHttpAdapter = ({
  handlers = {},
  defaultStatus = 200,
} = {}) => {
  const registry = { ...handlers };

  const register = (key, handler) => {
    registry[key] = handler;
  };

  const request = async (req = {}) => {
    const key = req.endpointId || `${(req.method || "GET").toUpperCase()} ${req.path || ""}`;
    const handler = registry[req.endpointId] || registry[key] || registry["*"];

    if (!handler) {
      const error = new Error(`MockHttpAdapter: no handler for ${key}`);
      error.response = {
        status: 404,
        data: { message: `No mock handler for ${key}` },
      };
      throw error;
    }

    const result = await handler(req);
    if (result && typeof result === "object" && "data" in result && "status" in result) {
      return {
        data: result.data,
        status: result.status,
        headers: result.headers || {},
      };
    }

    return {
      data: result,
      status: defaultStatus,
      headers: {},
    };
  };

  const port = {
    request,
    defaults: { headers: {} },
    interceptors: {
      request: { use: () => {}, eject: () => {} },
      response: { use: () => {}, eject: () => {} },
    },
    _axios: null,
    register,
  };

  const compat = withAxiosCompat(port);
  return Object.freeze({ ...compat, register });
};
