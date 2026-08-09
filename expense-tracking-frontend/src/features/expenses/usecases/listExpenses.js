/**
 * Pure use-case: list expenses.
 * @param {import('../ports/expenseRepository.port').ExpenseRepository} repo
 * @param {{ sortOrder?: string, targetId?: string }} [params]
 */
export const listExpenses = async (repo, params = {}) => {
  if (!repo || typeof repo.list !== "function") {
    throw new Error("listExpenses requires an ExpenseRepository");
  }
  return repo.list(params);
};
