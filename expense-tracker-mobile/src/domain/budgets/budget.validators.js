export function validateBudget(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = "validation.nameRequired";
  if (!data.amount || Number(data.amount) <= 0) errors.amount = "validation.amountInvalid";
  if (!data.period) errors.period = "validation.periodRequired";
  if (!data.startDate) errors.startDate = "validation.startDateRequired";
  if (data.period === "CUSTOM" && !data.endDate) errors.endDate = "validation.endDateRequired";
  if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = "validation.endDateBeforeStart";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
