/**
 * In-memory ExpenseRepository for tests and mock transport.
 */
export const createExpenseMockRepository = (seed = []) => {
  let expenses = [...seed];
  let nextId = expenses.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0) + 1;

  return Object.freeze({
    list: async () => [...expenses],
    listPaginated: async ({ page = 0, size = 100 } = {}) => {
      const start = page * size;
      const content = expenses.slice(start, start + size);
      return {
        content,
        page,
        size,
        totalElements: expenses.length,
        totalPages: Math.ceil(expenses.length / size) || 0,
      };
    },
    getById: async (id) => {
      const found = expenses.find((e) => String(e.id) === String(id));
      if (!found) {
        const err = new Error("Expense not found");
        err.response = { status: 404, data: { message: "Expense not found" } };
        throw err;
      }
      return found;
    },
    getDetailed: async (id) => createExpenseMockRepository(expenses).getById(id),
    create: async (expense) => {
      const created = { ...expense, id: nextId++ };
      expenses = [created, ...expenses];
      return created;
    },
    update: async (id, expense) => {
      expenses = expenses.map((e) =>
        String(e.id) === String(id) ? { ...e, ...expense, id: e.id } : e,
      );
      return expenses.find((e) => String(e.id) === String(id));
    },
    remove: async (id) => {
      const removed = expenses.find((e) => String(e.id) === String(id));
      expenses = expenses.filter((e) => String(e.id) !== String(id));
      return removed;
    },
    addMultiple: async (items) => {
      const created = items.map((item) => ({ ...item, id: nextId++ }));
      expenses = [...created, ...expenses];
      return created;
    },
    copy: async (expenseId) => {
      const original = await createExpenseMockRepository(expenses).getById(expenseId);
      return createExpenseMockRepository(expenses).create({
        ...original,
        id: undefined,
      });
    },
  });
};
