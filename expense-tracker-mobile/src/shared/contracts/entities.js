/**
 * @typedef {Object} MoneyValue
 * @property {number} amount
 * @property {string} currency
 */

/**
 * @typedef {Object} ExpenseEntity
 * @property {string|number} id
 * @property {string} title
 * @property {number} amount
 * @property {string} occurredAt
 * @property {string=} categoryId
 * @property {string=} paymentMethodId
 */

/**
 * @typedef {Object} BudgetEntity
 * @property {string|number} id
 * @property {string} name
 * @property {number} limit
 * @property {number} spent
 * @property {string} startDate
 * @property {string} endDate
 */

/**
 * @typedef {Object} RouteOwnership
 * @property {string} key
 * @property {string} owner
 * @property {"implemented"|"placeholder"|"migration"|"redirect"} status
 */
