/**
 * Pure use-case: create a single expense.
 * @param {import('../ports/expenseRepository.port').ExpenseRepository} repo
 * @param {object} expense
 * @param {string} [targetId]
 */
export const createExpense = async (repo, expense, targetId) => {
  if (!repo || typeof repo.create !== "function") {
    throw new Error("createExpense requires an ExpenseRepository");
  }
  if (!expense || typeof expense !== "object") {
    throw new Error("createExpense requires an expense payload");
  }
  return repo.create(expense, targetId);
};
