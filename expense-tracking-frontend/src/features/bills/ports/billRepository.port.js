/**
 * @typedef {Object} BillRepository
 * @property {(params: { month?: number, year?: number, targetId?: string }) => Promise<any>} list
 * @property {(params: { targetId?: string, filters?: object }) => Promise<any>} listAll
 * @property {(id: string|number, targetId?: string) => Promise<any>} getById
 * @property {(bill: object, targetId?: string) => Promise<any>} create
 * @property {(id: string|number, bill: object, targetId?: string) => Promise<any>} update
 * @property {(id: string|number, targetId?: string) => Promise<any>} remove
 */

export const assertBillRepository = (candidate) => {
  for (const method of ["list", "listAll", "getById", "create", "update", "remove"]) {
    if (typeof candidate?.[method] !== "function") {
      throw new Error(`BillRepository must implement ${method}()`);
    }
  }
  return true;
};
