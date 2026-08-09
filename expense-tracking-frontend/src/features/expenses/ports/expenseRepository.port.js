/**
 * Expense repository port — contract for expense persistence.
 *
 * @typedef {Object} ExpenseRepository
 * @property {(params: { sortOrder?: string, targetId?: string }) => Promise<any>} list
 * @property {(params: { page?: number, size?: number, sortOrder?: string, targetId?: string }) => Promise<any>} listPaginated
 * @property {(id: string|number, targetId?: string) => Promise<any>} getById
 * @property {(id: string|number, targetId?: string) => Promise<any>} getDetailed
 * @property {(expense: object, targetId?: string) => Promise<any>} create
 * @property {(id: string|number, expense: object, targetId?: string) => Promise<any>} update
 * @property {(id: string|number, targetId?: string) => Promise<any>} remove
 * @property {(expenses: object[], targetId?: string) => Promise<any>} addMultiple
 * @property {(id: string|number, targetId?: string) => Promise<any>} copy
 */

/**
 * @param {any} candidate
 * @returns {candidate is ExpenseRepository}
 */
export const assertExpenseRepository = (candidate) => {
  const required = [
    "list",
    "listPaginated",
    "getById",
    "create",
    "update",
    "remove",
  ];
  for (const method of required) {
    if (typeof candidate?.[method] !== "function") {
      throw new Error(`ExpenseRepository must implement ${method}()`);
    }
  }
  return true;
};
