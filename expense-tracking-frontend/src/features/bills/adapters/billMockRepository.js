export const createBillMockRepository = (seed = []) => {
  let bills = [...seed];
  let nextId = bills.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;

  return Object.freeze({
    list: async () => [...bills],
    listAll: async () => [...bills],
    getById: async (id) => {
      const found = bills.find((b) => String(b.id) === String(id));
      if (!found) {
        const err = new Error("Bill not found");
        err.response = { status: 404, data: { message: "Bill not found" } };
        throw err;
      }
      return found;
    },
    create: async (bill) => {
      const created = { ...bill, id: nextId++ };
      bills = [created, ...bills];
      return created;
    },
    update: async (id, bill) => {
      bills = bills.map((b) =>
        String(b.id) === String(id) ? { ...b, ...bill, id: b.id } : b,
      );
      return bills.find((b) => String(b.id) === String(id));
    },
    remove: async (id) => {
      const removed = bills.find((b) => String(b.id) === String(id));
      bills = bills.filter((b) => String(b.id) !== String(id));
      return removed;
    },
  });
};
