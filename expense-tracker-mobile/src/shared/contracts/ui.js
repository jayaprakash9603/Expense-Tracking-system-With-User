/**
 * @typedef {Object} AsyncState
 * @property {"idle"|"loading"|"success"|"error"} status
 * @property {string=} errorMessage
 */

/**
 * @typedef {Object} PaginationState
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalItems
 */

/**
 * @typedef {Object} ListViewState
 * @property {AsyncState} async
 * @property {PaginationState=} pagination
 * @property {boolean} hasData
 */
