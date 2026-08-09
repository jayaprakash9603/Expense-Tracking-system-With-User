import { createAxiosHttpAdapter } from "./axiosHttpAdapter";

/**
 * Snow simulator adapter — same axios transport, different base URL + optional
 * path rewriting via resolvePath (endpoint catalog overrides).
 *
 * @param {{
 *   baseURL: string,
 *   tokenPort: import('../../auth/tokenPort').TokenPort,
 *   resolvePath?: Function,
 * }} options
 */
export const createSnowHttpAdapter = (options) =>
  createAxiosHttpAdapter({
    ...options,
    baseURL: options.baseURL,
  });
