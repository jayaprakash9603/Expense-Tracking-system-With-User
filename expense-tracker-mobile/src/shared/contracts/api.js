/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number=} status
 * @property {string=} code
 * @property {Record<string, unknown>=} details
 */

/**
 * @template T
 * @typedef {Object} ApiResult
 * @property {boolean} success
 * @property {T=} data
 * @property {ApiError=} error
 */

/**
 * @template TPayload
 * @template TResponse
 * @callback ApiMutation
 * @param {TPayload} payload
 * @returns {Promise<ApiResult<TResponse>>}
 */
