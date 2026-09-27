/**
 * HTTP adapter for ExpenseRepository — uses HttpPort + endpoint catalog.
 *
 * @param {import('../../../platform/http/httpPort').HttpPort} http
 * @returns {import('../ports/expenseRepository.port').ExpenseRepository}
 */
export const createExpenseHttpRepository = (http) => {
  const request = (endpointId, { pathParams, query, body, skipAuth } = {}) =>
    http.request({
      endpointId,
      pathParams,
      query,
      body,
      skipAuth,
    });

  return Object.freeze({
    list: async ({ sortOrder = "desc", targetId } = {}) => {
      const { data } = await request("expenses.list", {
        query: { sortOrder, targetId: targetId || "" },
      });
      return data;
    },

    listPaginated: async ({
      page = 0,
      size = 100,
      sortOrder = "desc",
      targetId,
    } = {}) => {
      const { data } = await request("expenses.paginated", {
        query: { page, size, sortOrder, targetId: targetId || "" },
      });
      return data;
    },

    getById: async (id, targetId) => {
      const { data } = await request("expenses.by-id", {
        pathParams: { id },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    getDetailed: async (id, targetId) => {
      const { data } = await request("expenses.detailed", {
        pathParams: { id },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    create: async (expense, targetId) => {
      const { data } = await request("expenses.create", {
        body: expense,
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    update: async (id, expense, targetId) => {
      const { data } = await request("expenses.update", {
        pathParams: { id },
        body: expense,
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    remove: async (id, targetId) => {
      const { data } = await request("expenses.delete", {
        pathParams: { id },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    addMultiple: async (expenses, targetId) => {
      const { data } = await request("expenses.bulk-add", {
        body: expenses,
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    copy: async (expenseId, targetId) => {
      const { data } = await request("expenses.copy", {
        pathParams: { expenseId },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },
  });
};
