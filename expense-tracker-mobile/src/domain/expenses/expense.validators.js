export function validateExpense(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "validation.nameRequired";
  } else if (data.name.trim().length < 2) {
    errors.name = "validation.nameTooShort";
  }

  if (!data.amount && data.amount !== 0) {
    errors.amount = "validation.amountRequired";
  } else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    errors.amount = "validation.amountInvalid";
  }

  if (!data.date) {
    errors.date = "validation.dateRequired";
  }

  if (!data.category) {
    errors.category = "validation.categoryRequired";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateExpenseAmount(amount, budgetRemaining) {
  if (Number(amount) > budgetRemaining) {
    return { warning: "validation.exceedsBudget", severity: "warning" };
  }
  return null;
}
