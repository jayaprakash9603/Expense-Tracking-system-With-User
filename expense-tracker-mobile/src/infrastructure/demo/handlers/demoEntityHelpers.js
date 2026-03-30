export function matchExpenseIdFromDetailed(path) {
  const m = path.match(/^\/api\/expenses\/expense\/([^/]+)\/detailed$/);
  return m ? m[1] : null;
}

export function matchExpenseEdit(path) {
  const m = path.match(/^\/api\/expenses\/edit-expense\/([^/]+)$/);
  return m ? m[1] : null;
}

export function matchExpenseDelete(path) {
  const m = path.match(/^\/api\/expenses\/delete\/([^/]+)$/);
  return m ? m[1] : null;
}

export function matchBudgetId(path) {
  const m = path.match(/^\/api\/budgets\/([^/]+)$/);
  return m ? m[1] : null;
}

export function matchBudgetExpensesPath(path) {
  const m = path.match(/^\/api\/budgets\/([^/]+)\/expenses$/);
  return m ? m[1] : null;
}

export function matchBillId(path) {
  const m = path.match(/^\/api\/bills\/([^/]+)$/);
  return m ? m[1] : null;
}

export function matchCategoryId(path) {
  const m = path.match(/^\/api\/categories\/([^/]+)$/);
  return m ? m[1] : null;
}

export function mapExpenseOut(e, categories) {
  const cat = categories.find((c) => String(c.id) === String(e.categoryId));
  return {
    ...e,
    category: cat
      ? { id: cat.id, name: cat.name, color: cat.color, type: cat.type }
      : e.categoryName || "",
    expenseName: e.name,
  };
}
