/**
 * @param {import('../../../platform/http/httpPort').HttpPort} http
 */
export const createBillHttpRepository = (http) => {
  const request = (endpointId, opts = {}) =>
    http.request({ endpointId, ...opts });

  return Object.freeze({
    list: async ({ month, year, targetId } = {}) => {
      const query = { month, year };
      if (targetId) query.targetId = targetId;
      const { data } = await request("bills.list", { query });
      return data;
    },

    listAll: async ({ targetId, filters = {} } = {}) => {
      const query = { ...filters };
      if (targetId) query.targetId = targetId;
      Object.keys(query).forEach((key) => {
        if (query[key] === undefined || query[key] === null || query[key] === "") {
          delete query[key];
        }
      });
      const { data } = await request("bills.list", { query });
      return data;
    },

    getById: async (id, targetId) => {
      const { data } = await request("bills.by-id", {
        pathParams: { id },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    create: async (bill, targetId) => {
      const { data } = await request("bills.create", {
        body: bill,
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    update: async (id, bill, targetId) => {
      const { data } = await request("bills.update", {
        pathParams: { id },
        body: bill,
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },

    remove: async (id, targetId) => {
      const { data } = await request("bills.delete", {
        pathParams: { id },
        query: targetId ? { targetId } : undefined,
      });
      return data;
    },
  });
};
