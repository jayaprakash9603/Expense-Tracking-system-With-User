export function validateBill(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = "validation.nameRequired";
  if (!data.amount || Number(data.amount) <= 0) errors.amount = "validation.amountInvalid";
  if (!data.dueDate) errors.dueDate = "validation.dueDateRequired";
  if (!data.frequency) errors.frequency = "validation.frequencyRequired";
  return { valid: Object.keys(errors).length === 0, errors };
}
