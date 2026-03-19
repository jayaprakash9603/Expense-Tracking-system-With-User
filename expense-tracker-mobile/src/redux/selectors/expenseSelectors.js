export const selectExpenseList = (state) => state.expenses.list;
export const selectExpenseLoading = (state) => state.expenses.loading;
export const selectExpenseMutating = (state) => state.expenses.mutating;
export const selectExpenseError = (state) => state.expenses.error;
export const selectSelectedExpense = (state) => state.expenses.selected;
export const selectDailySpending = (state) => state.expenses.dailySpending;
export const selectCashflow = (state) => state.expenses.cashflow;
export const selectExpensePagination = (state) => state.expenses.pagination;
